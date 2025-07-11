CREATE DATABASE IF NOT EXISTS esc_hotel_db;
USE esc_hotel_db;

CREATE TABLE if NOT EXISTS users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       password VARCHAR(255) NOT NULL,
       name VARCHAR(255) NOT NULL,
       phone_number VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       loyalty_points INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (password, name, phone_number, email, loyalty_points) VALUES
('password123', 'Alice Johnson', '+1-555-0101', 'alice.johnson@email.com', 120),
('password123', 'Bob Smith', '+65 91234567', 'bob.smith@email.com', 85),
('password123', 'Carol Williams', '+1-555-0103', 'carol.williams@email.com', 200),
('password123', 'David Brown', '+1-555-0104', 'david.brown@email.com', 45),
('password123', 'Emma Davis', '+1-555-0105', 'emma.davis@email.com', 150),
('password123', 'Frank Miller', '+1-555-0106', 'frank.miller@email.com', 75)
ON DUPLICATE KEY UPDATE name=name;
