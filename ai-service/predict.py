import argparse
import json
from pathlib import Path
import pandas as pd
from src.config import load_config
from src.data import build_prediction_dataframe
from src.categories import suggest_specialist
from src.utils import load_joblib


def build_alerts(payload):
    alerts = []
    fever = str(payload["Fever"]).strip().lower() in {"yes", "1", "true"}
    cough = str(payload["Cough"]).strip().lower() in {"yes", "1", "true"}
    breathing = str(payload["Difficulty Breathing"]).strip().lower() in {"yes", "1", "true"}
    chest_pain = str(payload["Chest Pain"]).strip().lower() in {"yes", "1", "true"}
    age = int(float(payload["Age"]))
    temperature = float(payload["Temperature (C)"])

    if fever and temperature >= 39.0:
        alerts.append("High fever may need prompt medical attention.")
    if breathing and age >= 60:
        alerts.append("Difficulty breathing in an older patient can be urgent.")
    if chest_pain:
        alerts.append("Chest pain should be assessed by a qualified clinician.")
    if cough and breathing:
        alerts.append("Cough with breathing difficulty may need urgent evaluation.")
    return alerts


def predict_one(payload):
    config = load_config()
    root = Path(config["_root"])
    art = config["artifacts"]
    threshold = config["prediction"]["uncertainty_threshold"]

    model = load_joblib(root / art["best_model_path"])
    row = build_prediction_dataframe(payload)

    pred = model.predict(row)[0]
    result = {
        "predicted_category": str(pred),
        "base_prediction": str(pred),
        "recommended_specialist": suggest_specialist(str(pred)),
        "top_predictions": [],
        "confidence": None,
        "uncertain": False,
        "alerts": build_alerts(payload),
    }

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(row)[0]
        top_idx = proba.argsort()[::-1][:5]
        classes = model.classes_
        result["top_predictions"] = [
            {"category": str(classes[i]), "probability": round(float(proba[i]), 4)}
            for i in top_idx
        ]
        pred_index = list(classes).index(pred)
        result["confidence"] = round(float(proba[pred_index]), 4)
        if result["confidence"] < threshold:
            result["uncertain"] = True
            result["predicted_category"] = f"Uncertain ({pred})"

    return result


def predict_batch(input_csv: str, output_csv: str):
    config = load_config()
    root = Path(config["_root"])
    art = config["artifacts"]
    model = load_joblib(root / art["best_model_path"])

    df = pd.read_csv(input_csv)
    preds = model.predict(df)
    df["predicted_category"] = preds
    if hasattr(model, "predict_proba"):
        df["prediction_confidence"] = model.predict_proba(df).max(axis=1)
    df.to_csv(output_csv, index=False)
    return df


def main():
    parser = argparse.ArgumentParser(description="Disease category prediction from patient profile")
    parser.add_argument("--input_csv")
    parser.add_argument("--output_csv", default="predictions.csv")
    parser.add_argument("--json", action="store_true")

    parser.add_argument("--fever")
    parser.add_argument("--cough")
    parser.add_argument("--fatigue")
    parser.add_argument("--difficulty_breathing")
    parser.add_argument("--age")
    parser.add_argument("--gender")
    parser.add_argument("--blood_pressure")
    parser.add_argument("--cholesterol_level")
    parser.add_argument("--severity")
    parser.add_argument("--sore_throat")
    parser.add_argument("--runny_nose")
    parser.add_argument("--chest_pain")
    parser.add_argument("--headache")
    parser.add_argument("--nausea")
    parser.add_argument("--body_pain")
    parser.add_argument("--symptom_duration_days")
    parser.add_argument("--temperature_c")
    args = parser.parse_args()

    if args.input_csv:
        df = predict_batch(args.input_csv, args.output_csv)
        print(df.head())
        print(f"Saved predictions to {args.output_csv}")
        return

    fields = {
        "Fever": args.fever,
        "Cough": args.cough,
        "Fatigue": args.fatigue,
        "Difficulty Breathing": args.difficulty_breathing,
        "Age": args.age,
        "Gender": args.gender,
        "Blood Pressure": args.blood_pressure,
        "Cholesterol Level": args.cholesterol_level,
        "Severity": args.severity,
        "Sore Throat": args.sore_throat,
        "Runny Nose": args.runny_nose,
        "Chest Pain": args.chest_pain,
        "Headache": args.headache,
        "Nausea": args.nausea,
        "Body Pain": args.body_pain,
        "Symptom Duration (Days)": args.symptom_duration_days,
        "Temperature (C)": args.temperature_c,
    }
    if any(v is not None for v in fields.values()):
        missing = [k for k, v in fields.items() if v is None]
        if missing:
            raise SystemExit(f"Missing fields: {missing}")
        result = predict_one(fields)
        print(json.dumps(result) if args.json else json.dumps(result, indent=2))
        return

    raise SystemExit("Provide either --input_csv or all profile fields.")


if __name__ == "__main__":
    main()
