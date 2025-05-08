const express = require("express");
const userRoutes = require("./src/routes/userRoutes");
const fileReaderRoutes = require("./src/routes/fileReaderRoutes");
const asnRoutes = require("./src/routes/asnRoutes");

const app = express();
app.use(express.json());

app.get("/", (req: any, res: any) => { res.send("Welcome to BUN JS!") });
app.use("/api", [userRoutes, fileReaderRoutes, asnRoutes]);

// aws s3 connect
const S3Client = require("./src/services/s3Services");
const awsS3 = new S3Client();
// console.log(await awsS3.listFiles());
// awsS3.downloadFile("uat/bunjs/incoming/POALLOC.txt");
// awsS3.deleteFile("uat/bunjs/incoming/POALLOC.txt");

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)
})