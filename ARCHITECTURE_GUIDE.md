# Hospital Management System (HMS) - Architecture Guide

## 🏥 Project Overview
The Hospital Management System (HMS) is a modern, N-tier application designed to automate healthcare operations. It integrates a **Spring Boot** backend, a **React** frontend, and a **Flask-based Machine Learning service** for AI disease prediction.

---

## 📂 1. Folder Structure
The project is organized into three main micro-layers:

```text
/ (Root)
│
├── disease_prediction_project_category_model/  # ML Domain (Flask)
│   ├── models/                                 # Trained .joblib models & encoders
│   ├── notebooks/                              # EDA & Model training workbooks
│   ├── raw/                                    # Raw CSV datasets
│   ├── src/                                    # Data cleaning & evaluation logic
│   └── app.py                                  # Flask REST API (Port 5000)
│
├── frontend/                                   # UI Domain (React + Vite)
│   ├── src/
│   │   ├── components/                         # ChatBot.jsx, Layout.jsx, ProtectedRoute
│   │   ├── contexts/                           # AuthContext (JWT management)
│   │   ├── pages/                              # PatientDashboard, DiseasePrediction, etc.
│   │   └── utils/                              # Validation & API helpers
│   └── vite.config.js                          # Dev server & proxy settings (Port 3000)
│
├── src/main/java/com/hospital/                 # Backend Domain (Spring Boot)
│   ├── config/                                 # Security & API configurations
│   ├── controller/                             # REST Endpoints (Auth, Patient, Chatbot)
│   ├── dto/                                    # Request/Response Data Transfer Objects
│   ├── model/                                  # JPA Entities (Appointment, Patient, User)
│   ├── repository/                             # Data Access Layer (JPA/MySQL)
│   └── service/                                # Business Logic (OpenAIService, etc.)
│
├── pom.xml                                     # Maven Dependencies
└── ARCHITECTURE_GUIDE.md                       # System Documentation
```

---

## 💾 2. Database Management (Models & Relations)
The system uses **Spring Data JPA** with **MySQL** for persistence.

### Core Entities:
1. **User**: The base authentication entity (ID, Username, Email, Role).
2. **Patient**: Stores medical data. **Auto-links to a User record.**
3. **Doctor**: Specialized practitioners with consultation time-slots.
4. **Appointment**: The bridge between Doctors and Patients with 15-min slot logic.
5. **DiseasePrediction**: Stores AI results for historical tracking.

---

## 🤖 3. AI & Machine Learning Integration
The HMS features an advanced "Health Assistant" layer:

### ML API (Flask)
- **Model**: A trained Scikit-Learn model (`best_model.joblib`) for disease classification.
- **Endpoint**: `POST /predict` (Port 5000).
- **Function**: Receives symptoms and returns a predicted category with confidence and specialist recommendations.

### AI Chatbot (OpenAI-Powered)
- **Symptom Extraction**: Uses **OpenAI (GPT-4o-mini)** to parse user messages (e.g., *"I have a headache"*) and map them to structured symptoms.
- **Interconnect**: The Spring Boot backend acts as a bridge, calling OpenAI to extract data, then calling the Flask ML service to get the diagnosis, and finally saving the result to the Patient's record.

---

## 🛡️ 4. Security & Validation
### Multi-Layered Protection:
- **Spring Security**: JWT-based authentication for all API requests.
- **Role-Based Access (RBAC)**: REST endpoints are strictly protected via `@PreAuthorize`.
- **Self-Healing Profiles**: Registration is streamlined; the system automatically creates a `Patient` profile for any new user with `ROLE_PATIENT`.
- **Backend Validation**: JSR-303 annotations ensure strict data formats (e.g., +94 phone prefix).

---

*This document serves as the technical source of truth for the HMS project architecture.*
