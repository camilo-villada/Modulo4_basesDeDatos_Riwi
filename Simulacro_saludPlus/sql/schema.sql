CREATE DATABASE IF NOT EXISTS saludPlus;
USE saludPlus;

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(30),
  address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  specialty VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS insurances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  coverage_percentage DECIMAL(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id VARCHAR(50) NOT NULL UNIQUE,
  appointment_date DATE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  insurance_id INT NULL,
  treatment_code VARCHAR(50) NOT NULL,
  treatment_description VARCHAR(255) NOT NULL,
  treatment_cost DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  INDEX idx_appointments_date (appointment_date),
  INDEX idx_appointments_doctor (doctor_id),
  INDEX idx_appointments_insurance (insurance_id),
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  CONSTRAINT fk_appointments_insurance FOREIGN KEY (insurance_id) REFERENCES insurances(id)
);
