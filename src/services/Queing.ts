const { Queue, Worker  } = require("bullmq");
const Axios = require("../config/axios");
const Token = require("../services/token");
const { REDIS_HOST, REDIS_PORT } = process.env;
const Helpers = require("../helpers/global_function");

class Queing {
    private redisConfig = {
        host: REDIS_HOST,
        port: REDIS_PORT
    };

    public addJob(data: any, queue: string, jobName: string) {
        const myQueue = new Queue(queue, {
            connection: { redis: this.redisConfig },
        });
        myQueue.add(jobName, data, {attempts: 3, removeOnComplete: true});
    }

    public processVdrJob(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = JSON.stringify({
                    "data": job.data,
                });

                if (job.attemptsMade) { 
                    const log: any = ["VDR", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

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
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.data.length);
                    const log: any = ["VDR", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                });
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ VDR Data queues are completed!');
            Helpers.reacordActivityLog(["VDR", "ASN", "Data has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processPoAllocJob(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data

                if (job.attemptsMade) { 
                    const log: any = ["PO Alloc", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", job.data, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

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
                    console.log('error dito bakit kaya: Job ID '+ job.id +' | data length '+job.data.data.length);
                    const log: any = ["PO Alloc", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ PO Alloc queues are completed!');
            const asnController = require("../controllers/asnController");
            asnController.processPOAllocAff();
            Helpers.reacordActivityLog(["PO Alloc", "ASN", "File: POALLOC.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processPoSum(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data

                if (job.attemptsMade) { 
                    const log: any = ["PO Summary", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

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
                    const log: any = ["PO Summary", "ASN",  error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ PO Sum queues are completed!');
            const asnController = require("../controllers/asnController");
            asnController.processPODetails();
            Helpers.reacordActivityLog(["PO Sum", "ASN", "File: posum.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processPoAllocAff(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const json = job.data

                if (job.attemptsMade) { 
                    const log: any = ["PO Alloc Aff", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

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
                    const log: any = ["PO Alloc Aff", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ PO Alloc aff queues are completed!');
            const asnController = require("../controllers/asnController");
            asnController.processPOSet();
            Helpers.reacordActivityLog(["PO Alloc aff", "ASN", "File: POALLOC_AFF.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processPoSet(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = job.data

                if (job.attemptsMade) { 
                    const log: any = ["RCR Detail", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

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
                    const log: any = ["PO Set", "ASN",  error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ PO Set queues are completed!');
            Helpers.reacordActivityLog(["PO Set", "ASN", "File: POSET.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
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
                    const log: any = ["PO Detail", "ASN",  error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ PO Detail queues are completed!');
            const asnController = require("../controllers/asnController");
            asnController.processPOAlloc();
            Helpers.reacordActivityLog(["PO Detail", "ASN", "File: podetl.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processRcrSum(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = JSON.stringify({
                    "data_list": job.data,
                });

                if (job.attemptsMade) { 
                    const log: any = ["RCR Detail", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_rcr_api.process_documents_ds_rcr_bulk',
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
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.length);
                    const log: any = ["RCR Summary", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ RCRSUM queues are completed!');
            const asnController = require("../controllers/asnController");
            asnController.processRCRDetl();
            Helpers.reacordActivityLog(["RCRSUM", "ASN", "File: RCRSUM.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processRcrDetl(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = JSON.stringify({
                    "data_list": job.data,
                });

                if (job.attemptsMade) { 
                    const log: any = ["RCR Detail", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_rcr_details_api.process_documents_ds_rcr_details_bulk',
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
                    console.log('error dito bakit kaya: Job ID '+ job.id +'| data length '+job.data.length);
                    const log: any = ["RCR Detail", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                }); 
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ RCR Detail queues are completed!');
            Helpers.reacordActivityLog(["RCR Detail", "ASN", "File: RCRDTL.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }

    public processScDrr(queue: any) {
        const worker = new Worker(
            queue,
            async (job: any) => {
                const json = JSON.stringify({
                    "data_list": job.data,
                });

                if (job.attemptsMade) { 
                    const log: any = ["SCDRR", "ASN", "Retried jobs attempts " + job.attemptsMade, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                    throw new Error('Simulated job failure. Retried ' + job.attemptsMade + ' times.');
                }

                const TokenService = new Token();
                const reusableToken = await TokenService.getReusableToken();
                let config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: 'api/method/smr_asn.api.doc_ds_ddr_api.process_documents_ds_ddr_bulk',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Reusable-Token': reusableToken,
                    }, 
                    data : json,
                };

                try {
                    await Axios.request(config)
                } catch (error: any) {
                    const log: any = ["SCDRR", "ASN", error.message, "Error", json, Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    Helpers.reacordActivityLog(log);
                    throw error;
                }
            },
            { connection: { redis: this.redisConfig }}, 
        );
        
        worker.on('completed', (job: any) => {
            console.log(`🚦 Job ID ${job.id} has completed! Inserted ${job.data.length} data`);
        });
        
        worker.on('failed', (job: any, err: any) => {
            console.log(`Job ID ${job.id} has failed with ${err.message}`);
        });

        worker.on('drained', () => {
            console.log('✅ SCDRR Detail queues are completed!');
            Helpers.reacordActivityLog(["SCDRR", "ASN", "File: SCDRR.txt has been processed", "Completed", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]);
        });
    }
}

module.exports = Queing;