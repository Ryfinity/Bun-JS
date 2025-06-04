const mysql2 = require('mysql2/promise');
const { BUN_DB_HOST, BUN_DB_USER, BUN_DB_PASSWORD, BUN_DB_DATABASE, BUN_DB_PORT } = process.env;
 
const connection = mysql2.createPool({
    host: BUN_DB_HOST,
    user: BUN_DB_USER,
    password: BUN_DB_PASSWORD,
    database: BUN_DB_DATABASE,
    port: BUN_DB_PORT
});
 
module.exports = connection;