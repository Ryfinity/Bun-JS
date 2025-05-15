const database = require("../config/asn_connection");
const QueueService = require("../services/queueServices");
const fs = require('fs');
const fsPromises = require('fs').promises;

const getVdrData = async (req: any, res: any) => {
    try {
        const [rows] = await database.query("SELECT * FROM asn_vdr_data WHERE validation = 1 LIMIT 1");

        // rows.map((row: any) => {
        //     row.delivery_date = formatDate(row.delivery_date);
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

const processPOAlloc = async (req: any, res: any) => {
    const filePath = "public/downloads/sample.txt";
    const filePathHash = "public/downloads/sample.hsh";
    const hashValue = await calculateFileHash(filePathHash);

    fs.readFile(filePath, "utf8", async (err: any, data: any) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Error reading file");
            return;
        }
        const lines = data.toString().split("\r\n"); // Split the data into lines and process each line
        if (parseInt(hashValue[0]) != parseInt(lines.length)) {
            console.log("Cannot be process due to different length");
            res.status(200).json({message: "Cannot be process due to different length"});
            return;
        }

        const chunkSize = 500;
        const chunkedData = chunkData(lines, chunkSize); // Chunk the data
        
        const queueService = new QueueService("poAllocQueue", "poAllocJob");
        chunkedData.forEach(async (item) => {
            const json: any[] = [];
            item.forEach((i: any) => {
                const columns = i.split("|");
                json.push({
                    "glcmpn": columns[0].trim(),
                    "glcnam": columns[1].trim(),
                    "pspwhs": columns[2].trim(),
                    "pspnam": columns[3].trim(),
                    "povnum": columns[4].trim(),
                    "asnam": columns[5].trim(),
                    "ponumb": columns[6].trim(),
                    "pobon": columns[7].trim(),
                    "inumbr": columns[8].trim(),
                    "idescr": columns[9].trim(),
                    "podpt": columns[10].trim(),
                    "posdpt": columns[11].trim(),
                    "dptnam": columns[12].trim(),
                    "poscst": columns[13].trim(),
                    "posret": columns[14].trim(),
                    "ibyum": columns[15].trim(),
                    "islum": columns[16].trim(),
                    "potype": columns[17].trim(),
                    "tbldsc": columns[18].trim(),
                    "posdat": columns[19].trim(),
                    "pocdat": columns[20].trim(),
                    "tmpdsc": columns[21].trim(),
                    "typtag": columns[22].trim(),
                    "label": columns[23].trim(),
                    "poloc1": columns[24].trim(),
                    "strn01": columns[25].trim(),
                    "poqty1": columns[26].trim(),
                    "poloc2": columns[27].trim(),
                    "strn02": columns[28].trim(),
                    "poqty2": columns[29].trim(),
                    "poloc3": columns[30].trim(),
                    "strn03": columns[31].trim(),
                    "poqty3": columns[32].trim(),
                    "poloc4": columns[33].trim(),
                    "strn04": columns[34].trim(),
                    "poqty4": columns[35].trim(),
                    "poloc5": columns[36].trim(),
                    "strn05": columns[37].trim(),
                    "poqty5": columns[38].trim(),
                    "poloc6": columns[39].trim(),
                    "strn06": columns[40].trim(),
                    "poqty6": columns[41].trim(),
                    "poloc7": columns[42].trim(),
                    "strn07": columns[43].trim(),
                    "poqty7": columns[44].trim(),
                    "istyln": columns[45].trim(),
                    "sstyle": columns[46].trim(),
                    "poretl": columns[47].trim(),
                    "pocost": columns[48].trim(),
                    "total": columns[49].trim(),
                    "buyer": columns[50].trim(),
                    "printd": columns[51].trim(),
                    "date_added": getDateTimeNow(),
                    "date_updated": getDateTimeNow(),
                    "header_unique_identifier": columns[4].trim()+"-"+columns[0].trim()+"-"+columns[2].trim()+"-"+columns[10].trim()+"-"+columns[6].trim(),
                    "detail_unique_identifier": getDateTimeNow(),
                    "unique_identifier": columns[4].trim()+"-"+columns[1].trim()+"-"+columns[2].trim()+"-"+columns[12].trim()+"-"+columns[6].trim()+"-"+
                    columns[0].trim()+"-"+columns[11].trim()+"-"+columns[24].trim(),
                });
            });
            await queueService.addJob(json);
        });
        await queueService.processPoAllocJob();

        res.status(200).json({message: "Data processed successfully"});
    });
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

const getDateTimeNow = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const calculateFileHash = async (filePath: any) => {
    const data = await fsPromises.readFile(filePath, "utf8");
    return data.split(",");
}

module.exports = { getVdrData, processPOAlloc };