const config = require("./config");

const mysql = require('mysql');

const sqlConnection = mysql.createConnection(config);

module.exports = sqlConnection;
