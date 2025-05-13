const database = require("../config/asn_connection");
const QueueService = require("../services/queueServices");

const getVdrData = async (req: any, res: any) => {
    try {
        const [rows] = await database.query("SELECT * FROM asn_vdr_data WHERE validation = 1 LIMIT 1");

        // rows.map((row: any) => {
        //     row.delivery_date = formatDate(row.delivery_date);
        //     // row.date_updated = formatDate(row.date_updated);
        //     // row.date_created = formatDate(row.date_created);
        //     return row;
        // });

        const chunkSize = 1000; // Define the chunk size
        const removeKey = "id"; // Define the key to be removed from each object
        const rowsWithoutKey = removeKeyFromObjects(rows, removeKey); // Remove the key from each object
        const chunkedData = chunkData(rowsWithoutKey, chunkSize); // Chunk the data

        const queueService = new QueueService("vdrQueue", "vdrJob");
        chunkedData.forEach(async (item) => {
            await queueService.addJob(item);
        });
        await queueService.processVdrJob();

        res.status(200).json({message: "Data processed successfully"});
    } catch {
        res.status(500).send("Internal Error");
    }
}

const chunkData = (data: any, chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
}

const removeKeyFromObjects = (arr: any, key: string) => {
    return arr.map((obj: any) => {
        const { [key]: _, ...rest } = obj; // Destructure to remove the key
        return rest;
    });
}

const formatDate = (date: any) => {
    const dateObj = date.toLocaleDateString().split("/").reverse();
    return dateObj[0] + "-" + dateObj[2] + "-" + dateObj[1];
}

module.exports = { getVdrData };