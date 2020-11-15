-- Drops the employee_trackerdb if it exists currently --
DROP DATABASE IF EXISTS employee_trackerdb;
-- Creates the "employee_trackerdb" database --
CREATE DATABASE employee_trackerdb;

USE employee_trackerdb;

-- Create the table department.
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

-- Create the table role.
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INT NOT NULL,
    CONSTRAINT FK_department FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Create the table employee.
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    CONSTRAINT FK_role FOREIGN KEY (role_id) REFERENCES role(id)
);

