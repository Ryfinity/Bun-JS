
const S3Client = require("../config/S3Connection");
const { ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_S3_BUCKET, AWS_S3_REGION, AWS_S3_INCOMING_PREFIX, AWS_S3_ARCHIVE_PREFIX } = process.env
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class AwsS3 {
    private bucketName: any = AWS_S3_BUCKET;
    private region: any = AWS_S3_REGION;
    private incoming: any = AWS_S3_INCOMING_PREFIX;
    private archive: any = AWS_S3_ARCHIVE_PREFIX;
    
    async listFiles() {
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
        return files.slice(1);
    }
    
    async fileURL(key: any, fileName: any) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(S3Client, command);
        return url;
        
    }
    
    async deleteFile(key: any, fileName: string) {
        const copyparams = {
            Bucket: this.bucketName,
            CopySource: this.bucketName + '/' + key,
            Key: this.archive + '/' + fileName
        };
        await S3Client.send(new CopyObjectCommand(copyparams));
 
        const deleteparams = {
            Bucket: this.bucketName,
            Key: key
        };
 
        await S3Client.send(new DeleteObjectCommand(deleteparams));
        console.log(`📁 File moved from ${deleteparams.Key} to ${copyparams.Key}`);
        return `File moved from ${deleteparams.Key} to ${copyparams.Key}`;
    }
}

module.exports = AwsS3;