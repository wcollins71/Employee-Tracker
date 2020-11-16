var express = require("express");
var inquirer = require("inquirer");
var connection = require("./config/connection");
require("console.table");

let roles = [];
function listRoles() {
    connection.query("SELECT * FROM role", function (err, results) {
        if (err) throw err;
        roles = [];
        var eachResult = {};
        for (var i = 0; i < results.length; i++) {
            var eachResult = results[i].id + ": " + results[i].title;
            roles.push(eachResult);
        }
        listEmployees();
    });

}

let employees = [];
function listEmployees() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        employees = [];
        var eachResult = {};
        for (var i = 0; i < results.length; i++) {
            var eachResult = results[i].id + ": " + results[i].first_name + " " + results[i].last_name;
            employees.push(eachResult);
        }
        listManagers();
    });
}

let managers = [];
function listManagers() {
    connection.query("SELECT DISTINCT `manager`.`manager_id`, `employee`.`first_name`, `employee`.`last_name` \
    FROM `employee` `manager`\
    INNER JOIN `employee` ON (`manager`.`manager_id` = `employee`.`id`) \
    GROUP BY `manager`.`manager_id`", function (err, resultsManager) {
        if (err) throw err;
        managers = [];
        var eachResult = {};
        for (var i = 0; i < resultsManager.length; i++) {
            var eachResult = resultsManager[i].manager_id + ": " + resultsManager[i].first_name + " " + resultsManager[i].last_name;
            managers.push(eachResult);
        }
        listDepartments();
    });
}

let departments = [];
function listDepartments() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        departments = [];
        var eachResult = {};
        for (var i = 0; i < results.length; i++) {
            var eachResult = results[i].id + ": " + results[i].name;
            departments.push(eachResult);
        }
        start();
    });
}


var PORT = process.env.PORT || 8080;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    prestart();
});

function prestart() {
    listRoles();
}

function start() {
    inquirer
        .prompt({
            name: "menuMain",
            type: "list",
            message: "Would you like to do?",
            choices:
                [
                    "View All Employees",
                    "View All Employees By Department",
                    "View All Employees By Manager",
                    "Add Employee",
                    "Remove Employee",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "View All Role",
                    "Add Role",
                    "Remove Role",
                    "View All Departments",
                    "Add Department",
                    "Remove Department",
                    "Quit"
                ]
        })
        .then(function (answer) {
            switch (answer.menuMain) {
                case "View All Employees":
                    viewResults("all", answer.menuMain);
                    break;
                case "View All Employees By Department":
                    selectDeptView();
                    break;
                case "View All Employees By Manager":
                    selectManagerView();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;
                case "View All Role":
                    viewRoles();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Remove Role":
                    removeRole();
                    break;
                case "View All Departments":
                    viewDepartments();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Remove Department":
                    removeDepartment();
                    break;

                default:
                    quit();
            }
        });
}

function removeDepartment() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "list",
                choices: departments,
                message: "Which department do you want to remove?"
            }
        ])
        .then(function (answer) {
            let departmentId = answer.department.substr(0, answer.department.indexOf(':'));
            connection.query("DELETE FROM department WHERE ?",
                {
                    id: departmentId
                },
                function (err, res) {
                    if (err) throw err;
                    console.log("Department deleted\n");
                });
            prestart();
        });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What department would you like to add?"
            }
        ])
        .then(function (answer) {
            connection.query("INSERT INTO department (name) VALUES (?)",
                [answer.name],
                function (err, res) {
                    if (err) throw err;
                    console.log("Department added");
                });
            prestart();
        });

}

function viewDepartments() {
    console.table(departments);
    prestart();
}

function removeRole() {
    inquirer
        .prompt([
            {
                name: "role",
                type: "list",
                choices: roles,
                message: "Which role do you want to remove?"
            }
        ])
        .then(function (answer) {
            let roleId = answer.role.substr(0, answer.role.indexOf(':'));
            connection.query("DELETE FROM role WHERE ?",
                {
                    id: roleId
                },
                function (err, res) {
                    if (err) throw err;
                    console.log("Role deleted\n");
                });
            prestart();
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "title",
                message: "What role would you like to add?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary for the role?"
            },
            {
                type: "list",
                name: "department",
                message: "What department will the role belong to?",
                choices: departments
            }
        ])
        .then(function (answer) {
            let departmentId = answer.department.substr(0, answer.department.indexOf(':'));
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                [answer.title, answer.salary, departmentId],
                function (err, res) {
                    if (err) throw err;
                    console.log("Role added");
                });
            prestart();
        });
}

function viewRoles() {
    console.table(roles);
    prestart();
}

function updateEmployeeManager() {
    inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                choices: employees,
                message: "Which employee do you want to update?"
            },
            {
                name: "manager",
                type: "list",
                choices: employees,
                message: "Which manager will the employee report to?"
            }
        ])
        .then(function (answer) {
            let employeeId = answer.employee.substr(0, answer.employee.indexOf(':'));
            let managerId = answer.manager.substr(0, answer.manager.indexOf(':'));
            connection.query("UPDATE employee SET ? WHERE ?",
                [
                    {
                        manager_id: managerId
                    },
                    {
                        id: employeeId
                    }
                ],
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " Manager updated\n");
                });
            prestart();
        });
}

function updateEmployeeRole() {
    inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                choices: employees,
                message: "Which employee do you want to update?"
            },
            {
                name: "role",
                type: "list",
                choices: roles,
                message: "Which role do you want to change to?"
            }
        ])
        .then(function (answer) {
            let employeeId = answer.employee.substr(0, answer.employee.indexOf(':'));
            let roleId = answer.role.substr(0, answer.role.indexOf(':'));
            connection.query("UPDATE employee SET ? WHERE ?",
                [
                    {
                        role_id: roleId
                    },
                    {
                        id: employeeId
                    }
                ],
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " Employee updated\n");
                });
            prestart();
        });
}


function removeEmployee() {
    inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                choices: employees,
                message: "Which employees do you want to remove?"
            }
        ])
        .then(function (answer) {
            console.log(answer.employee)
            let employeeId = answer.employee.substr(0, answer.employee.indexOf(':'));
            connection.query("DELETE FROM employee WHERE ?",
                {
                    id: employeeId
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " Employee deleted\n");
                });
            prestart();
        });
}


function addEmployee() {

    inquirer
        .prompt([
            {
                type: "input",
                name: "employeeFirstName",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "employeeLastName",
                message: "What is the employee's last name?"
            },
            {
                name: "role",
                type: "list",
                choices: roles,
                message: "What is the employee' role?"
            },
            {
                name: "manager",
                type: "list",
                choices: managers,
                message: "Who is the employee' manager?"
            }
        ])
        .then(function (answer) {
            let roleId = answer.role.substr(0, answer.role.indexOf(':'));
            let managerId = answer.manager.substr(0, answer.manager.indexOf(':'));
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                [answer.employeeFirstName, answer.employeeLastName, roleId, managerId],
                function (err, res) {
                    if (err) throw err;
                    console.log("Employee added");
                });

            prestart();
        });

}

function selectDeptView() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "list",
                choices: departments,
                message: "Which department would you like to see employees for?"
            }
        ])
        .then(function (answer) {
            //  console.log(choiceArray)
            let departmentId = answer.department.substr(0, answer.department.indexOf(':'));
            viewResults("department", departmentId);
        });
}

function selectManagerView() {
    inquirer
        .prompt([
            {
                name: "menuManager",
                type: "list",
                choices: managers,
                message: "Which manager would you like to see employees for?"
            }
        ])
        .then(function (answer) {
            //  console.log(choiceArray)
            let managerId = answer.menuManager.substr(0, answer.menuManager.indexOf(':'));
            viewResults("manager", managerId);
        });
}

function viewResults(queryParam, queryRequest) {
    let viewEmployeesQuery = "SELECT \
    `employee`.`id` AS ID, \
    `employee`.`first_name` AS 'First Name', \
    `employee`.`last_name` AS 'Last Name', \
    `role`.`title` AS 'Position Title', \
    `department`.`name` AS Department, \
    `role`.`salary` AS Salary, \
    (CASE WHEN `employee`.`manager_id` IS NOT NULL THEN CONCAT(`manager`.`first_name`, ' ', `manager`.`last_name`) ELSE '' END) AS `Manager` \
  FROM \
    `department` \
    INNER JOIN `role` ON (`department`.`id` = `role`.`department_id`) \
    INNER JOIN `employee` ON (`role`.`id` = `employee`.`role_id`) \
    LEFT OUTER JOIN `employee` `manager` ON (`manager`.`id` = `employee`.`manager_id`)\
    "
    if (queryParam === "department") {
        viewEmployeesQuery += " WHERE `department`.`id` = '" + queryRequest + "' \
        ORDER BY `employee`.`id`"
        console.log(`All ${queryRequest} employees...\n`);
    } else if (queryParam === "manager") {
        viewEmployeesQuery += " WHERE `employee`.`manager_id` = '" + queryRequest + "' \
        ORDER BY `employee`.`id`"
        console.log(`All manager's employees...\n`);
    } else {
        viewEmployeesQuery += " ORDER BY `employee`.`id`"
        console.log(`All employees...\n`);
    }
    connection.query(viewEmployeesQuery, function (err, res) {
        if (err) throw err;
        console.table(res);
        prestart();
    });
}

function quit() {
    connection.end();
    process.exit();
}