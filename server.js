var express = require("express");
var inquirer = require("inquirer");
var connection = require("./config/connection");
require("console.table");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

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
                    "Remove Roles",
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

                default:
                    quit();
            }

        });
}

function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        var eachResult = {};
                        for (var i = 0; i < results.length; i++) {
                            var eachResult = results[i].id + ": " + results[i].first_name + " " + results[i].last_name;
                            //  console.log(eachResult)
                            choiceArray.push(eachResult);
                        }
                        return choiceArray;
                    },
                    message: "Which employee do you want to update?"
                }
            ])
            .then(function (answer) {
                let employeeId = answer.employee.substr(0, answer.employee.indexOf(':'));
                connection.query("SELECT * FROM role", function (err, resultsRole) {
                    if (err) throw err;
                    inquirer
                        .prompt([
                            {
                                name: "role",
                                type: "list",
                                choices: function () {
                                    var choiceArray = [];
                                    var eachResult = {};
                                    for (var i = 0; i < results.length; i++) {
                                        var eachResult = results[i].id + ": " + results[i].title;
                                        //  console.log(eachResult)
                                        choiceArray.push(eachResult);
                                    }
                                    return choiceArray;
                                },
                                message: "Which role do you want to change to?"
                            }
                        ])
                        .then(function (answer) {
                            console.log(answer.employee)
                            let roleId = answer.role.substr(0, answer.role.indexOf(':'));
                            
                            connection.query("DELETE FROM employee WHERE ?",
                                {
                                    id: employeeId
                                },
                                function (err, res) {
                                    if (err) throw err;
                                    console.log(res.affectedRows + " Employee deleted\n");
                                });

                            start();
                        });
                });
            });

    });
}


function removeEmployee() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        var eachResult = {};
                        for (var i = 0; i < results.length; i++) {
                            var eachResult = results[i].id + ": " + results[i].first_name + " " + results[i].last_name;
                            //  console.log(eachResult)
                            choiceArray.push(eachResult);
                        }
                        return choiceArray;
                    },
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

                start();
            });

    });
}


function addEmployee() {
    connection.query("SELECT * FROM role", function (err, resultsRole) {
        if (err) throw err;
        connection.query("SELECT DISTINCT `manager`.`manager_id`, `employee`.`first_name`, `employee`.`last_name` \
        FROM `employee` `manager`\
        INNER JOIN `employee` ON (`manager`.`manager_id` = `employee`.`id`) \
        GROUP BY `manager`.`manager_id`", function (err, resultsManager) {
            if (err) throw err;
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
                        choices: function () {
                            var choiceArray = [];
                            var eachResult = {};
                            for (var i = 0; i < resultsRole.length; i++) {
                                var eachResult = resultsRole[i].id + ": " + resultsRole[i].title;
                                //  console.log(eachResult)
                                choiceArray.push(eachResult);
                            }
                            return choiceArray;
                        },
                        message: "What is the employee' role?"
                    },
                    {
                        name: "manager",
                        type: "list",
                        choices: function () {
                            var choiceArray = [];
                            var eachResult = {};
                            for (var i = 0; i < resultsManager.length; i++) {
                                var eachResult = resultsManager[i].manager_id + ": " + resultsManager[i].first_name + " " + resultsManager[i].last_name;
                                //  console.log(eachResult)
                                choiceArray.push(eachResult);
                            }
                            return choiceArray;
                        },
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

                    start();
                });
        });
    });
}

function selectDeptView() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "menuDept",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].name);
                        }
                        return choiceArray;
                    },
                    message: "Which department would you like to see employees for?"
                }
            ])
            .then(function (answer) {
                //  console.log(choiceArray)
                viewResults("department", answer.menuDept);
            });
    });
}

function selectManagerView() {
    connection.query("SELECT DISTINCT `manager`.`manager_id`, `employee`.`first_name`, `employee`.`last_name` \
    FROM `employee` `manager`\
    INNER JOIN `employee` ON (`manager`.`manager_id` = `employee`.`id`) \
    GROUP BY `manager`.`manager_id`", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "menuManager",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        var eachResult = {};
                        for (var i = 0; i < results.length; i++) {
                            var eachResult = results[i].manager_id + ": " + results[i].first_name + " " + results[i].last_name;
                            //  console.log(eachResult)
                            choiceArray.push(eachResult);

                        }
                        return choiceArray;
                    },
                    message: "Which manager would you like to see employees for?"
                }
            ])
            .then(function (answer) {
                //  console.log(choiceArray)
                let managerId = answer.menuManager.substr(0, answer.menuManager.indexOf(':'));
                viewResults("manager", managerId);
            });
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
    ORDER BY `employee`.`id`"
    if (queryParam === "department") {
        viewEmployeesQuery += " WHERE `department`.`name` = '" + queryRequest + "'"
        console.log(`All ${queryRequest} employees...\n`);
    } else if (queryParam === "manager") {
        viewEmployeesQuery += " WHERE `employee`.`manager_id` = '" + queryRequest + "'"
        console.log(viewEmployeesQuery)
        console.log(`All manager's employees...\n`);
    } else {
        console.log(`All employees...\n`);
    }
    connection.query(viewEmployeesQuery, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });

}

function quit() {
    connection.end();
    process.exit();
}