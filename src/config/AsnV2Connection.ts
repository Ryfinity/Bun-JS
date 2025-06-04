const mysql2 = require('mysql2/promise');
const { ASN_V2_DB_HOST, ASN_V2_DB_USER, ASN_V2_DB_PASSWORD, ASN_V2_DB_DATABASE, ASN_V2_DB_PORT } = process.env;
 
const connection = mysql2.createPool({
    host: ASN_V2_DB_HOST,
    user: ASN_V2_DB_USER,
    password: ASN_V2_DB_PASSWORD,
    database: ASN_V2_DB_DATABASE,
    port: ASN_V2_DB_PORT
});
 
module.exports = connection;