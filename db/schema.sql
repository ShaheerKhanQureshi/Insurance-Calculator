-- db/schema.sql
CREATE DATABASE IF NOT EXISTS insurance_calculator;
USE insurance_calculator;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    work_email VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    include_maternity BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'submitted') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- HR Plans table
CREATE TABLE IF NOT EXISTS hr_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    age_band VARCHAR(50) NOT NULL,
    number_of_lives INT NOT NULL DEFAULT 0,
    premium_rate DECIMAL(10,2) NOT NULL,
    calculated_premium DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- Maternity Plans table
CREATE TABLE IF NOT EXISTS maternity_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    age_band VARCHAR(50) NOT NULL,
    number_of_spouses INT NOT NULL DEFAULT 0,
    premium_rate DECIMAL(10,2) NOT NULL,
    calculated_premium DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- Plan Selections table
CREATE TABLE IF NOT EXISTS plan_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    plan_type ENUM('hr', 'maternity') NOT NULL,
    selected_plans JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- Calculations table
CREATE TABLE IF NOT EXISTS calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    hr_total_lives INT NOT NULL DEFAULT 0,
    hr_total_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
    maternity_total_lives INT NOT NULL DEFAULT 0,
    maternity_total_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
    waiver_percentage INT NOT NULL DEFAULT 0,
    maternity_coverage_status VARCHAR(100),
    final_calculation JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);