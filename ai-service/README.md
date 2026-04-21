# Disease Category Prediction AI Service (Fixed for New Dataset)

This package is updated to use your new `disease_dataset.csv` file.

## What was changed

- removed the old dataset reference
- added the new dataset into `data/raw/disease_dataset.csv`
- removed leakage columns from training:
  - `Outcome Variable`
  - `Original Disease`
- updated preprocessing for the new columns
- updated prediction API and CLI to accept the new symptom fields
- retrained model artifacts can be generated with `python train.py`

## Target classes

The model predicts these disease categories:

- Cancer
- Cardio
- Dermatology_Allergy
- Endocrine
- Gastro_Hepato_Renal
- Infectious
- Mental_Health
- Musculoskeletal
- Neurological
- Other
- Respiratory

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Train the model

```powershell
python train.py
```

## Run prediction from CLI

```powershell
python predict.py `
  --fever yes `
  --cough yes `
  --fatigue no `
  --difficulty_breathing yes `
  --age 34 `
  --gender Female `
  --blood_pressure Normal `
  --cholesterol_level Normal `
  --severity Moderate `
  --sore_throat yes `
  --runny_nose no `
  --chest_pain no `
  --headache yes `
  --nausea no `
  --body_pain yes `
  --symptom_duration_days 5 `
  --temperature_c 38.6
```

## Run Flask API

```powershell
python app.py
```

API URL:

```text
http://localhost:5000/predict
```

## JSON body example

```json
{
  "fever": "yes",
  "cough": "yes",
  "fatigue": "no",
  "difficulty_breathing": "yes",
  "age": 34,
  "gender": "Female",
  "blood_pressure": "Normal",
  "cholesterol_level": "Normal",
  "severity": "Moderate",
  "sore_throat": "yes",
  "runny_nose": "no",
  "chest_pain": "no",
  "headache": "yes",
  "nausea": "no",
  "body_pain": "yes",
  "symptom_duration_days": 5,
  "temperature_c": 38.6
}
```

## Notes

- This is an educational ML project.
- It predicts disease categories, not a medical diagnosis.
- If you retrain the model, the new reports will be written to `reports/`.
