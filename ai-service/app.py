from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_one

app = Flask(__name__)
CORS(app)

REQUIRED_FIELDS = [
    "fever",
    "cough",
    "fatigue",
    "difficulty_breathing",
    "age",
    "gender",
    "blood_pressure",
    "cholesterol_level",
    "severity",
    "sore_throat",
    "runny_nose",
    "chest_pain",
    "headache",
    "nausea",
    "body_pain",
    "symptom_duration_days",
    "temperature_c",
]


def normalize_payload(data: dict) -> dict:
    return {
        "Fever": data.get("fever"),
        "Cough": data.get("cough"),
        "Fatigue": data.get("fatigue"),
        "Difficulty Breathing": data.get("difficulty_breathing"),
        "Age": data.get("age"),
        "Gender": data.get("gender"),
        "Blood Pressure": data.get("blood_pressure"),
        "Cholesterol Level": data.get("cholesterol_level"),
        "Severity": data.get("severity"),
        "Sore Throat": data.get("sore_throat"),
        "Runny Nose": data.get("runny_nose"),
        "Chest Pain": data.get("chest_pain"),
        "Headache": data.get("headache"),
        "Nausea": data.get("nausea"),
        "Body Pain": data.get("body_pain"),
        "Symptom Duration (Days)": data.get("symptom_duration_days"),
        "Temperature (C)": data.get("temperature_c"),
    }


@app.get('/health')
def health():
    return jsonify({"status": "healthy", "service": "disease-prediction-ai"})


@app.post('/predict')
def predict():
    data = request.get_json(silent=True) or {}
    missing = [field for field in REQUIRED_FIELDS if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        result = predict_one(normalize_payload(data))
        top_predictions = []
        for item in result.get("top_predictions", []):
            top_predictions.append({
                "category": item.get("category"),
                "confidence": item.get("probability", item.get("confidence")),
            })

        return jsonify({
            "predicted_category": result.get("predicted_category"),
            "prediction": result.get("base_prediction", result.get("predicted_category")),
            "confidence": result.get("confidence"),
            "recommended_specialist": result.get("recommended_specialist"),
            "top_predictions": top_predictions,
            "uncertain": result.get("uncertain", False),
            "alerts": result.get("alerts", []),
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
