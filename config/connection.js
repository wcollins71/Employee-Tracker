// Set up MySQL connection.
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "UDM4KMKfzyRk",
  database: "employee_trackerdb"
});

// Export connection for our ORM to use.
module.exports = connection;
