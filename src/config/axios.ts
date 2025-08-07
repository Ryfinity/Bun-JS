const axios = require('axios');
const { ASN_URL, ASN_API_KEY, ASN_API_SECRET } = process.env;

const instance = axios.create({
    baseURL: ASN_URL,
    // timeout: 10000,
    headers: {
        'Authorization': 'token ' + ASN_API_KEY + ':' + ASN_API_SECRET,
        'Cookie': 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en;'
    }
});

module.exports = instance;