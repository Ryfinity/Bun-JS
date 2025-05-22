const { Queue, QueueEvents, Worker  } = require("bullmq");
const IORedis = require("ioredis");
const axios = require("../config/axios");
const token = require("../services/token");
const { REDIS_HOST, REDIS_PORT } = process.env;
const fs = require('fs');

class QueueService {
    private queue: any;
    private jobName: any;
    private redisConfig = {
        host: REDIS_HOST,
        port: REDIS_PORT
    };

    // constructor(queue: any, jobName: any) {
    //     this.queue = queue;
    //     this.jobName = jobName;
    // }

    public addVdrJob(data: any, queue: any, jobName: any) {
        const myQueue = new Queue(queue, {
            defaultJobOptions: {
                attempts: 3,
                // backoff: {
                //   type: 'exponential',
                //   delay: 1000,
                // },
            },
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data);
    }

    public processVdrJob(queue: any) {
        const worker = new Worker(
            queue, // worker name
            async (job: any) => {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const json = JSON.stringify({
                    "data": job.data,
                });

                const tokenService = new token();
                const reusableToken = await tokenService.getReusableToken();

                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.asn_vdr_api.upsert_sample',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    },
                    data : json,
                };

                await axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log(error);
                });
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`${job.id} has completed!`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

    public addPoAllocJob(data: any, queue: any, jobName: any) {
        const myQueue = new Queue(queue, {
            defaultJobOptions: {
                attempts: 3,
            },
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data);
    }

    public processPoAllocJob(queue: any) {
        const worker = new Worker(
            queue, // worker name
            async (job: any) => {
                // await new Promise((resolve) => setTimeout(resolve, 2000));
                const json = job.data
                const tokenService = new token();
                const reusableToken = await tokenService.getReusableToken();

                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_po_alloc_api.upsert_documents_ds_po_alloc',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                await axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya');
                    console.log(error);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

    public addPOSumJob(data: any, queue: any, jobName: any) {
        const myQueue = new Queue(queue, {
            defaultJobOptions: {
                attempts: 3,
            },
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data);
    }

    public processPoSum(queue: any) {
        const worker = new Worker(
            queue, // worker name
            async (job: any) => {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const json = job.data
                // fs.writeFile('public/downloads/file_'+job.id+'.txt', JSON.stringify(json), (err: any) => {
                //     if (err) {
                //       console.error(err);
                //     }
                // });
                const tokenService = new token();
                const reusableToken = await tokenService.getReusableToken();

                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_po_api.upsert_documents_ds_po',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                await axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya');
                    console.log(error.message);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

    public addPOAllocAffJob(data: any, queue: any, jobName: any) {
        const myQueue = new Queue(queue, {
            defaultJobOptions: {
                attempts: 3,
            },
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data);
    }

    public processPoAllocAff(queue: any) {
        const worker = new Worker(
            queue, // worker name
            async (job: any) => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const json = job.data
                const tokenService = new token();
                const reusableToken = await tokenService.getReusableToken();
                
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_po_aff_api.upsert_documents_ds_po_aff',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                await axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya');
                    console.log(error.message);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

}

module.exports = QueueService;