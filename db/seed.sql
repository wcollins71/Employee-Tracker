USE employee_trackerdb;

INSERT INTO department (name)
VALUES 
	('Sales'), 
    ('Engineering'),
    ('Finance'),
    ('Legal');
    
INSERT INTO role
	(title, salary, department_id)
VALUES
	('Sales Manager', 120000, 1),
	('Salesperson', 85000, 1),
	('Chief Engineer', 135000, 2),
	('Engineer', 110000, 1),
	('Cadet Engineer', 44200, 2),
	('CEO', 185000, 3),
	('Financial Controller', 115000, 3),
	('Legal Counsel', 132000, 4);
    
INSERT INTO employee
	(first_name, last_name, role_id, manager_id)
VALUES
	('Bob', 'Jones', 1),
	('Sam', 'Smith', 1, 1),
	('Jill', 'Pulman', 2),
	('Alex', 'Peters', 2, 3),
	('Jane', 'Winks', 3),
	('David', 'Lock', 3, 5),
	('Andrew', 'Woodward', 4),
	('James', 'Earl', 4, 7);
