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

CREATE TABLE if NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_name VARCHAR(255),
  room_type VARCHAR(100),
  number_of_nights INT,
  start_date DATE,
  end_date DATE,
  num_adults INT,
  num_children INT,
  price DECIMAL(10, 2),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bookings (
  hotel_name, room_type, number_of_nights,
  start_date, end_date,
  num_adults, num_children, price,
  first_name, last_name, phone_number, email,
  special_requests
) VALUES
  ('Grand Hotel', 'Double Room', 4, '2023-12-01', '2023-12-05', 2, 0, 500.00, 'John', 'Doe', '12345678', 'john@example.com', 'Late check-in if possible'),
  ('Ocean Breeze Resort', 'Suite', 3, '2023-11-10', '2023-11-13', 2, 1, 750.00, 'Alice', 'Tan', '98765432', 'alice.tan@example.com', 'Need a crib for toddler'),
  ('City Lights Inn', 'Single Room', 2, '2023-10-05', '2023-10-07', 1, 0, 180.00, 'Mark', 'Nguyen', '81234567', 'mark.nguyen@example.com', 'Quiet room away from elevator'),
  ('Mountain View Lodge', 'Deluxe Room', 5, '2023-12-20', '2023-12-25', 2, 2, 1200.00, 'Sarah', 'Lee', '92345678', 'sarah.lee@example.com', 'Adjoining rooms if possible')
ON DUPLICATE KEY UPDATE hotel_name = hotel_name;



