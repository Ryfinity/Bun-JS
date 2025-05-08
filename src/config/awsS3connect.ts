const { S3Client } = require("@aws-sdk/client-s3");
const { AWS_S3_REGION, AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY} = process.env

const s3Client = new S3Client({
    region: AWS_S3_REGION,
    credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY,
        secretAccessKey: AWS_S3_SECRET_KEY, 
    }
});

module.exports = s3Client;