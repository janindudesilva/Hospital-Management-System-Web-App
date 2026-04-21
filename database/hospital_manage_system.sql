drop database hospital_manage_system;
CREATE DATABASE IF NOT EXISTS hospital_manage_system;
USE hospital_manage_system;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS disease_predictions;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST', 'ROLE_PATIENT') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    nic_passport VARCHAR(50),
    age INT,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    phone VARCHAR(20),
    address TEXT,
    blood_group VARCHAR(20),
    date_of_birth DATE,
    emergency_contact VARCHAR(20),
    medical_history TEXT,
    user_id BIGINT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    qualification VARCHAR(200),
    experience VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    department VARCHAR(100) NOT NULL, 
    consultation_fee DECIMAL(10,2),
    available_from VARCHAR(20),
    available_to VARCHAR(20),
    max_patients_per_day INT,
    department_id BIGINT NOT NULL,
    user_id BIGINT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATETIME NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL,
    type ENUM('ONLINE', 'OFFLINE', 'EMERGENCY') NOT NULL DEFAULT 'ONLINE',
    symptoms TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    symptoms TEXT,
    treatment TEXT,
    notes TEXT,
    follow_up_date DATE,
    is_chronic BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_medical_records_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_medical_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    diagnosis VARCHAR(255),
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    instructions TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_prescriptions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_fee DECIMAL(10,2) DEFAULT 0.00,
    lab_fee DECIMAL(10,2) DEFAULT 0.00,
    medicine_fee DECIMAL(10,2) DEFAULT 0.00,
    other_charges DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_bills_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    CONSTRAINT fk_bills_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE disease_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    symptoms TEXT,
    predicted_category VARCHAR(255),
    recommended_specialist VARCHAR(255),
    confidence DOUBLE,
    prediction_date DATETIME,
    top_predictions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_disease_predictions_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    doctor_id BIGINT,
    appointment_id BIGINT,
    rating INT NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    patient_name VARCHAR(100),
    doctor_name VARCHAR(100),
    department VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_reviews_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_reviews_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_disease_predictions_patient ON disease_predictions(patient_id);

CREATE TABLE doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_doctor_availability_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE time_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    version BIGINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_time_slots_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

ALTER TABLE appointments
    ADD COLUMN slot_id BIGINT NULL,
    ADD COLUMN start_time DATETIME NULL,
    ADD COLUMN end_time DATETIME NULL;

ALTER TABLE appointments
    ADD CONSTRAINT fk_appointments_slot
    FOREIGN KEY (slot_id) REFERENCES time_slots(id);


