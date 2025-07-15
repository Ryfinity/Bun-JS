const { Queue } = require("bullmq");
const asnController = require("../controllers/asnController");
const Helpers = require("../helpers/global_function");

class Scheduler {

    async scdrr(shouldStop: boolean, interval: number, queueName: string) {
        while (!shouldStop) {
            const queue = new Queue(queueName);
            const counts = await queue.getJobCounts();
            const totalJobs = counts.completed + counts.delayed + 
                            counts.active + counts.waiting + counts.paused;

            if (await Helpers.checkFileIfExist("SCRDR.txt")) {
                if (totalJobs === 0) {
                    await asnController.processSCDRR();
                } else {
                    console.log('⏳ The scdrr queue is not empty. Job counts waiting:', counts.waiting);
                }
            } else {
                console.log("❌ SCRDR file not found. Waiting for files to be available.");
            }
            
            await this.sleep(interval);
        }
    }

    async rcrsum(shouldStop: boolean, interval: number, queueName: string) {
        while (!shouldStop) {
            const queue = new Queue(queueName);
            const counts = await queue.getJobCounts();
            const totalJobs = counts.completed + counts.delayed + 
                            counts.active + counts.waiting + counts.paused;

            if (await Helpers.checkFileIfExist("RCRSUM.txt") && await Helpers.checkFileIfExist("RCRDTL.txt")) {
                if (totalJobs === 0) {
                    await asnController.processRCRSum();
                } else {
                    console.log('⏳ The rcrsum queue is not empty. Job counts waiting:', counts.waiting);
                }
            } else {
                console.log("❌ RCRSUM or RCRDTL file not found. Waiting for files to be available.");
            }

            await this.sleep(interval);
        }
    }

    async vdrdata(shouldStop: boolean, interval: number, queueName: string) {
        while (!shouldStop) {
            const queue = new Queue(queueName);
            const counts = await queue.getJobCounts();
            const totalJobs = counts.completed + counts.delayed + 
                            counts.active + counts.waiting + counts.paused;

            if (totalJobs === 0) {
                await asnController.processVdrdata();
            } else {
                console.log('⏳ The vdrdata queue is not empty. Job counts waiting:', counts.waiting);
            }

            await this.sleep(interval);
        }
    }

    async posum(shouldStop: boolean, interval: number, queueName: string) {
        while (!shouldStop) {
            const queue = new Queue(queueName);
            const counts = await queue.getJobCounts();
            const totalJobs = counts.completed + counts.delayed + 
                            counts.active + counts.waiting + counts.paused;

            if (await Helpers.checkFileIfExist("posum.txt") && await Helpers.checkFileIfExist("posum.hsh")
                && await Helpers.checkFileIfExist("podetl.txt") && await Helpers.checkFileIfExist("podetl.hsh")
                && await Helpers.checkFileIfExist("POALLOC.txt") && await Helpers.checkFileIfExist("POALLOC.hsh")
                && await Helpers.checkFileIfExist("POALLOC_AFF.txt") && await Helpers.checkFileIfExist("POALLOC_AFF.hsh")) {
                if (totalJobs === 0) {
                    await asnController.processPOSum();
                } else {
                    console.log('⏳ The scdrr queue is not empty. Job counts waiting:', counts.waiting);
                }
            } else {
                console.log("❌ PO files not yet completed. Waiting for files to be available.");
            }
            
            await this.sleep(interval);
        }
    }

    sleep(interval: number) {
        return new Promise(resolve => setTimeout(resolve, interval));
    }
}

module.exports = Scheduler;