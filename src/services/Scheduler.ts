const { Queue } = require("bullmq");
const asnController = require("../controllers/asnController");

class Scheduler {

    async scdrr(shouldStop: boolean, interval: number, queueName: string) {
        while (!shouldStop) {
            const queue = new Queue(queueName);
            const counts = await queue.getJobCounts();
            const totalJobs = counts.completed + counts.delayed + 
                            counts.active + counts.waiting + counts.paused;

            if (totalJobs === 0) {
                await asnController.processSCDRR();
            } else {
                console.log('The scdrr queue is not empty. Job counts waiting:', counts.waiting);
            }
            await this.sleep(interval);
        }
    }

    sleep(interval: number) {
        return new Promise(resolve => setTimeout(resolve, interval));
    }
}

module.exports = Scheduler;