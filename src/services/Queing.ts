const { Queue, Worker  } = require("bullmq");
const Axios = require("../config/Axios");
const Token = require("../services/Token");
const { REDIS_HOST, REDIS_PORT } = process.env;
const Helpers = require("../helpers/global_function")

class Queing {
    private redisConfig = {
        host: REDIS_HOST,
        port: REDIS_PORT
    };

    public addJob(data: any, queue: string, jobName: string) {
        const myQueue = new Queue(queue, {
            defaultJobOptions: {
                attempts: 3,
            },
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data);
    }

    public processVdrJob(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = JSON.stringify({
                    "data": job.data,
                });

                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();

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

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log(error);
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Alloc", "ASN", "PO Alloc Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
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

    public processPoAllocJob(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data
                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();

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

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Alloc", "ASN", "PO Alloc Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
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

    public processPoSum(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data
                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();

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

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Summary", "ASN", "PO Summary Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
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

    public processPoAllocAff(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const json = job.data
                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                
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

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Alloc Aff", "ASN", "PO Alloc Aff Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
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

    public processPoSet(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data
                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_po_prepack_api.upsert_documents_ds_po_repack',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Set", "ASN", "PO Set Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`Job ID ${job.id} has completed! Inserted ${job.data.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

    public processPoDetl(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data
                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_po_detail_api.upsert_documents_ds_po_detail',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                await Axios.request(config)
                .then((response: any) => {  
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error: any) => {
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    var data = [{
                        'error': error,
                        'data': job.data
                    }];
                    const log: any = ["PO Detail", "ASN", "PO Detail Error", "Error", data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`Job ID ${job.id} has completed! Inserted ${job.data.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }
}

module.exports = Queing;