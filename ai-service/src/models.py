from scipy.stats import randint
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from .features import build_preprocessor

def get_model_spaces(config: dict) -> dict:
    prep_cfg = config["preprocessing"]
    numeric = prep_cfg["numeric_features"]
    binary = prep_cfg["binary_yes_no_features"]
    categorical = prep_cfg["categorical_features"]
    random_state = config["project"]["random_state"]

    tree_pre = build_preprocessor(numeric, binary, categorical, scale_numeric=False)
    linear_pre = build_preprocessor(numeric, binary, categorical, scale_numeric=True)

    return {
        "random_forest": {
            "pipeline": Pipeline([
                ("preprocess", tree_pre),
                ("model", RandomForestClassifier(
                    random_state=random_state,
                    class_weight="balanced_subsample",
                    n_jobs=-1,
                )),
            ]),
            "params": {
                "model__n_estimators": randint(250, 700),
                "model__max_depth": [None, 8, 12, 16, 24],
                "model__min_samples_split": randint(2, 10),
                "model__min_samples_leaf": randint(1, 5),
                "model__max_features": ["sqrt", "log2", None],
            },
        },
        "extra_trees": {
            "pipeline": Pipeline([
                ("preprocess", tree_pre),
                ("model", ExtraTreesClassifier(
                    random_state=random_state,
                    class_weight="balanced",
                    n_jobs=-1,
                )),
            ]),
            "params": {
                "model__n_estimators": randint(250, 700),
                "model__max_depth": [None, 8, 12, 16, 24],
                "model__min_samples_split": randint(2, 10),
                "model__min_samples_leaf": randint(1, 5),
                "model__max_features": ["sqrt", "log2", None],
            },
        },
        "logistic_regression": {
            "pipeline": Pipeline([
                ("preprocess", linear_pre),
                ("model", LogisticRegression(
                    max_iter=10000,
                    class_weight="balanced",
                    solver="saga",
                )),
            ]),
            "params": {
                "model__C": [0.01, 0.1, 1.0, 10.0, 50.0],
                "model__penalty": ["l1", "l2"],
            },
        },
    }


def tune_single_model(model_name, model_spec, X_train, y_train, cv_folds, scoring, n_iter, random_state, n_jobs):
    min_count = int(y_train.value_counts().min())
    actual_folds = max(2, min(cv_folds, min_count))
    cv = StratifiedKFold(n_splits=actual_folds, shuffle=True, random_state=random_state)
    search = RandomizedSearchCV(
        estimator=model_spec["pipeline"],
        param_distributions=model_spec["params"],
        n_iter=n_iter,
        scoring=scoring,
        cv=cv,
        random_state=random_state,
        verbose=1,
        n_jobs=n_jobs,
        refit=True,
        return_train_score=True,
    )
    search.fit(X_train, y_train)
    return {
        "model_name": model_name,
        "best_estimator": search.best_estimator_,
        "best_score": float(search.best_score_),
        "best_params": search.best_params_,
    }
