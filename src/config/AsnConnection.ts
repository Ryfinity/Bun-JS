const mysql2 = require('mysql2/promise');
const { ASN_DB_HOST, ASN_DB_USER, ASN_DB_PASSWORD, ASN_DB_DATABASE, ASN_DB_PORT } = process.env;
 
const connection = mysql2.createPool({
    host: ASN_DB_HOST,
    user: ASN_DB_USER,
    password: ASN_DB_PASSWORD,
    database: ASN_DB_DATABASE,
    port: ASN_DB_PORT
});
 
module.exports = connection;