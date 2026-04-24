import json
import warnings
from pathlib import Path
from src.config import load_config
from src.data import load_dataset, clean_and_prepare_dataset, split_features_target, dataset_diagnostics, warn_about_dataset, make_train_test_split, encode_target
from src.models import get_model_spaces, tune_single_model
from src.evaluate import evaluate_model, save_metrics, save_text_report, save_cv_results, extract_feature_importance, save_confusion_matrix
from src.utils import ensure_dir, save_joblib, save_json

warnings.filterwarnings("ignore")


def main():
    config = load_config()
    root = Path(config["_root"])
    data_cfg = config["data"]
    train_cfg = config["training"]
    art = config["artifacts"]

    ensure_dir(root / art["model_dir"])
    ensure_dir(root / "reports")

    print("1) Loading dataset...")
    df_raw = load_dataset(root / data_cfg["raw_data_path"])
    print(f"   Raw shape: {df_raw.shape}")

    print("2) Cleaning dataset...")
    df, clean_info = clean_and_prepare_dataset(
        df_raw,
        target_column=data_cfg["target_column"],
        leakage_columns=data_cfg.get("leakage_columns", []),
        drop_exact_duplicates=data_cfg.get("drop_exact_duplicates", True),
    )
    print(json.dumps(clean_info, indent=2))

    print("3) Diagnostics...")
    diagnostics = dataset_diagnostics(df, data_cfg["target_column"])
    print(json.dumps(diagnostics, indent=2))
    warnings_list = warn_about_dataset(diagnostics)
    for item in warnings_list:
        print(f"   - {item}")

    print("4) Split features and target...")
    X, y = split_features_target(df, data_cfg["target_column"])
    print(f"   Features: {list(X.columns)}")

    print("5) Train/test split...")
    X_train, X_test, y_train, y_test = make_train_test_split(
        X, y, test_size=data_cfg["test_size"], random_state=config["project"]["random_state"]
    )
    print(f"   Train: {X_train.shape}, Test: {X_test.shape}")

    print("6) Encode label space...")
    _, label_encoder = encode_target(y)

    print("7) Hyperparameter tuning...")
    spaces = get_model_spaces(config)
    results = []
    for model_name in train_cfg["models_to_try"]:
        print(f"\n--- Tuning {model_name} ---")
        result = tune_single_model(
            model_name=model_name,
            model_spec=spaces[model_name],
            X_train=X_train,
            y_train=y_train,
            cv_folds=train_cfg["cv_folds"],
            scoring=train_cfg["scoring"],
            n_iter=train_cfg["randomized_search_iterations"][model_name],
            random_state=config["project"]["random_state"],
            n_jobs=train_cfg["n_jobs"],
        )
        results.append(result)
        print(f"Best CV score: {result['best_score']:.4f}")
        print(f"Best params: {result['best_params']}")

    results.sort(key=lambda r: r["best_score"], reverse=True)
    best = results[0]
    best_model = best["best_estimator"]

    print("\n8) Evaluating best model...")
    metrics, report_text, confusion, confusion_labels = evaluate_model(
        best_model, X_test, y_test, label_encoder
    )
    print(json.dumps(metrics, indent=2))

    print("9) Saving artifacts...")
    save_joblib(best_model, root / art["best_model_path"])
    save_joblib(label_encoder, root / art["label_encoder_path"])
    save_joblib(list(X.columns), root / art["feature_columns_path"])
    save_metrics(metrics, root / art["metrics_path"])
    save_text_report(report_text, root / art["classification_report_path"])
    save_cv_results(results, root / art["cv_results_path"])
    save_confusion_matrix(confusion, confusion_labels, root / art["confusion_matrix_path"])

    fi = extract_feature_importance(best_model)
    if not fi.empty:
        fi.to_csv(root / art["feature_importance_path"], index=False)

    metadata = {
        "project_name": config["project"]["name"],
        "best_model_name": best["model_name"],
        "best_cv_score": best["best_score"],
        "best_params": {k: str(v) for k, v in best["best_params"].items()},
        "target_column": data_cfg["target_column"],
        "cleaning_info": clean_info,
        "diagnostics": diagnostics,
        "warnings": warnings_list,
        "metrics": metrics,
        "classes": list(label_encoder.classes_),
        "notes": [
            "This version uses the new uploaded dataset.",
            "Outcome Variable and Original Disease are removed to avoid leakage.",
            "Severity and Age Group are used as model inputs.",
            "Educational prototype only."
        ],
    }
    save_json(metadata, root / art["metadata_path"])

    summary_lines = [
        "# Project Analysis",
        "",
        "## Dataset used",
        f"- File: {data_cfg['raw_data_path']}",
        f"- Rows after cleaning: {clean_info['rows_after_cleaning']}",
        f"- Target classes: {diagnostics['n_target_classes']}",
        "",
        "## Leakage prevention",
        f"- Removed columns: {', '.join(clean_info['removed_leakage_columns']) or 'None'}",
        "",
        "## Recommendation",
        "- Use this as a disease-category prediction prototype.",
        "- Do not present this as a medical diagnosis system.",
    ]
    (root / "reports" / "project_analysis.md").write_text("\n".join(summary_lines), encoding="utf-8")
    print("Done.")


if __name__ == "__main__":
    main()
