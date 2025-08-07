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

const { Queue, QueueEvents, Worker  } = require("bullmq");
const IORedis = require("ioredis");

// const connection = new IORedis({ 
//     port: 6379, // Redis port
//     host: "127.0.0.1",
// });
// connection.on('connect', () => {
//     console.log('Redis connected');
// }
// );

const redis = {
    host: '127.0.0.1',
    port: 6379,
}

const myQueue = new Queue('foo', {
    connection: { redis },
});
// myQueue.add('myJobName', { foo: 'bar' }); // jobname | key | value
// myQueue.add('myJobName', { qux: 'baz' });


const worker = new Worker(
    'foo', // worker name
    async (job: any) => {
        // Will print { foo: 'bar'} for the first job
        // and { qux: 'baz' } for the second.
        console.log(job.data); 
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return "Done successfully";
    },
    { connection: { redis }}, 
);

worker.on('completed', (job: any) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job: any, err: any) => {
    console.log(`${job.id} has failed with ${err.message}`);
});

// const queueEvents = new QueueEvents("foo", {connection: { redis },});

// queueEvents.on('waiting', ({ jobId }: any) => {
//     console.log(`A job with ID ${jobId} is waiting`);
// });

// queueEvents.on('active', ({ jobId, prev }: any) => {
//     console.log(`Job ${jobId} is now active; previous status was ${prev}`);
// });

// queueEvents.on('completed', ({ jobId, returnvalue }: any) => {
//     console.log(`${jobId} has completed and returned ${returnvalue}`);
// });

// queueEvents.on('failed', ({ jobId, failedReason }: any) => {
//     console.log(`${jobId} has failed with reason ${failedReason}`);
// });

// const queueEvents = new QueueEvents("foo");
// queueEvents.on('progress', ({ jobId }: any) => {
//     console.log(`A job with ID ${jobId} is waiting`);
// });
  


app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)
})