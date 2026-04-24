from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    top_k_accuracy_score,
)

def evaluate_model(model, X_test, y_test, label_encoder):
    y_pred = model.predict(X_test)

    metrics = {
        "test_accuracy": float(accuracy_score(y_test, y_pred)),
        "test_balanced_accuracy": float(balanced_accuracy_score(y_test, y_pred)),
        "test_f1_macro": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
        "test_f1_weighted": float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
        "test_rows": int(len(y_test)),
        "test_unique_classes": int(y_test.nunique()),
    }

    if hasattr(model, "predict_proba"):
        y_test_enc = label_encoder.transform(y_test.astype(str))
        proba = model.predict_proba(X_test)
        metrics["test_top_3_accuracy"] = float(
            top_k_accuracy_score(
                y_test_enc,
                proba,
                k=min(3, proba.shape[1]),
                labels=np.arange(len(label_encoder.classes_)),
            )
        )

    present_labels = sorted(pd.Series(y_test.astype(str)).unique().tolist())

    report = classification_report(
        y_test.astype(str),
        pd.Series(y_pred).astype(str),
        labels=present_labels,
        target_names=present_labels,
        zero_division=0,
    )

    conf = confusion_matrix(
        y_test.astype(str),
        pd.Series(y_pred).astype(str),
        labels=present_labels,
    )

    return metrics, report, conf, present_labels

def save_metrics(metrics, path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

def save_text_report(text, path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def save_cv_results(results, path):
    rows = [
        {
            "model_name": r["model_name"],
            "best_score": r["best_score"],
            "best_params": str(r["best_params"]),
        }
        for r in results
    ]
    df = pd.DataFrame(rows).sort_values("best_score", ascending=False)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)

def extract_feature_importance(model):
    preprocess = model.named_steps["preprocess"]
    estimator = model.named_steps["model"]

    try:
        names = preprocess.get_feature_names_out()
    except Exception:
        names = [f"feature_{i}" for i in range(getattr(estimator, "n_features_in_", 0))]

    if hasattr(estimator, "feature_importances_"):
        importance = estimator.feature_importances_
    elif hasattr(estimator, "coef_"):
        coef = estimator.coef_
        importance = abs(coef).mean(axis=0) if len(coef.shape) == 2 else abs(coef)
    else:
        return pd.DataFrame(columns=["feature", "importance"])

    return pd.DataFrame({
        "feature": names,
        "importance": importance
    }).sort_values("importance", ascending=False)

def save_confusion_matrix(confusion, labels, path):
    df = pd.DataFrame(confusion, index=labels, columns=labels)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path)
