
const S3Client = require("../config/awsS3connect");
const { ListObjectsV2Command, GetObjectAclCommand, DeleteObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const https = require("https");
const fs = require("fs");

class AwsS3 {
    private bucketName: any = process.env.AWS_S3_BUCKET;
    private region: any = process.env.AWS_S3_REGION;
    private incoming: any = process.env.AWS_S3_INCOMING_PREFIX;
    private archive: any = process.env.AWS_S3_ARCHIVE_PREFIX;
    private pathDownload = "public/downloads/";
    
    constructor() {
        // Initialize AWS S3 client here
    }

    async listFiles() {
        // Logic to list files from S3
        const files : any[] = [];
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,    
            Prefix: this.incoming,
        });

        const response = await S3Client.send(command);
        if (response.Contents) {
            response.Contents.forEach((file: any) => {
                files.push({
                    key: file.Key,
                    lastModified: file.LastModified,
                    size: file.Size,
                });
            });
        }
        return files;
    }
    
    async downloadFile(key: any){
        // Logic to upload file to S3
        const command = new GetObjectAclCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(S3Client, command);
        https.get(url, (res: any) => {
            const path = this.pathDownload + "Sample.txt";
            const writeStream = fs.createWriteStream(path);
            res.pipe(writeStream);

            writeStream.on("finish", () => {
                writeStream.close();
                console.log("File downloaded successfully.");
            });

            writeStream.on("error", (err: any) => {
                console.error("Error writing file:", err);
            });
        });
        return url;
    }
    
    async deleteFile(key: any) {
        // Logic to delete file from S3
        const copyparams = {
            Bucket: this.bucketName,
            CopySource: this.bucketName + '/' + key,
            Key: this.archive + '/POALLOC.txt'
        };
        await S3Client.send(new CopyObjectCommand(copyparams));

        const deleteparams = {
            Bucket: this.bucketName,
            Key: key
        };

        await S3Client.send(new DeleteObjectCommand(deleteparams));
        console.log(`File moved from ${copyparams.Key} to ${deleteparams.Key}`);
    }
}

module.exports = AwsS3;