const axios = require("../config/axios");
 
class Token {
    async getReusableToken() {
        let token = "";
        const config = {
            method: "POST",
            maxBodyLength: Infinity,
            url: "api/method/smr_asn.api.reusable_token_test.generate_reusable_token",
        };
         
        await axios.request(config)
        .then((response: any) => {
            token = response.data.message.token.token
        })
        .catch((error: any) => {
            console.log(error);
        });
       
        return token
    }
}
 
module.exports = Token