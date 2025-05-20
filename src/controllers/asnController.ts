const database = require("../config/asn_connection");
const QueueService = require("../services/queue");
const fs = require('fs');
const fsPromises = require('fs').promises;
const S3Client = require("../services/s3");
const https = require("https");

const getVdrData = async (req: any, res: any) => {
    try {
        const [rows] = await database.query("SELECT * FROM asn_vdr_data WHERE validation = 1 LIMIT 1");

        rows.map((row: any) => {
            row.delivery_date = formatDate(row.delivery_date);
            return row;
        });
        const chunkSize = 1000; // Define the chunk size
        const removeKey = "id"; // Define the key to be removed from each object
        const rowsWithoutKey = removeKeyFromObjects(rows, removeKey); // Remove the key from each object
        const chunkedData = chunkData(rowsWithoutKey, chunkSize); // Chunk the data
        
        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            await queueService.addVdrJob(item, "vdrQueue", "vdrJob");
        });
        await queueService.processVdrJob("vdrQueue");

        res.status(200).json({message: "Data processed successfully"});
    } catch {
        res.status(500).send("Internal Error");
    }
}

const processPOAlloc = async (req: any, res: any) => {
    const awsS3 = new S3Client();
    const files = await awsS3.listFiles();
    const filteredFiles = files.filter((file: any) => file.key.includes("POALLOC.hsh") || file.key.includes("POALLOC.txt")).map((file: any) => file.key);
    
    if (filteredFiles[0]) {
        var file1 = filteredFiles[0];
        await awsS3.downloadFile(file1, file1.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    if (filteredFiles[1]) {
        var file2 = filteredFiles[1];
        await awsS3.downloadFile(file2, file2.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 20000));

    const filePath = await "public/downloads/"+ file2.split("/").slice(-1).pop();
    const filePathHash = await "public/downloads/"+ file1.split("/").slice(-1).pop();
    const hashValue = await calculateFileHash(filePathHash);

    await fs.readFile(filePath, "utf8", async (err: any, data: any) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Error reading file");
            return;
        }
        const lines = await data.toString().split("\r\n"); // Split the data into lines and process each line
        const removeLine = await data.toString().split('\n').filter((line: any) => line.trim() !== '').join('\n');
        console.log(parseInt(hashValue[0])+"-"+parseInt(removeLine.split("\r\n").length))
        if (parseInt(hashValue[0]) != parseInt(removeLine.split("\r\n").length)) {
            console.log("Cannot be process due to different length");
            res.status(200).json({message: "Cannot be process due to different length"});
            return;
        }
        const chunkSize = 1000;
        const chunkedData = chunkData(lines, chunkSize); // Chunk the data
        
        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            const json: any[] = [];
            const newItem = item.filter((obj: any) => Object.keys(obj).length > 0)
            newItem.forEach((i: any) => {
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
            await queueService.addPoAllocJob(json, "poAllocQueue", "poAllocJob");
        });
        await queueService.processPoAllocJob("poAllocQueue");

        res.status(200).json({message: "PO Allocation. Data processed successfully"});
    });
}

const processPOSum = async (req: any, res: any) => {
    const awsS3 = new S3Client();
    const files = await awsS3.listFiles();
    const filteredFiles = files.filter((file: any) => file.key.includes("posum.hsh") || file.key.includes("posum.txt")).map((file: any) => file.key);
    
    if (filteredFiles[0]) {
        var file1 = filteredFiles[0];
        await awsS3.downloadFile(file1, file1.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    if (filteredFiles[1]) {
        var file2 = filteredFiles[1];
        await awsS3.downloadFile(file2, file2.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const filePath = await "public/downloads/"+ file2.split("/").slice(-1).pop();
    const filePathHash = await "public/downloads/"+ file1.split("/").slice(-1).pop();
    const hashValue = await calculateFileHash(filePathHash);

    await fs.readFile(filePath, "utf8", async (err: any, data: any) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Error reading file");
            return;
        }
        const lines = await data.toString().split("\r\n");
        const removeLine = await data.toString().split('\n').filter((line: any) => line.trim() !== '').join('\n');
        console.log(parseInt(hashValue[0])+"-"+parseInt(removeLine.split("\r\n").length))
        if (parseInt(hashValue[0]) != parseInt(removeLine.split("\r\n").length)) {
            console.log("Cannot be process due to different length");
            res.status(200).json({message: "Cannot be process due to different length"});
            return;
        }
        const chunkSize = 1000;
        const chunkedData = chunkData(lines, chunkSize);

        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            const json: any[] = [];
            const newItem = item.filter((obj: any) => Object.keys(obj).length > 0)
            newItem.forEach((i: any) => {
                const columns = i.split("|");
                json.push({
                    // "id": columns[0].trim(),
                    "vendor_code": columns[0].trim(),
                    "department_code": columns[16].trim(),
                    "sub_dept_code": '',
                    "vendor_name": columns[1].trim(),
                    "company_name": columns[5].trim(),
                    "document_no": columns[6].trim(),
                    "reference_no": '',
                    "department_name": columns[3].trim(),
                    "ship_to": columns[7].trim(),
                    "location": columns[4].trim(),
                    "date_entry": formatDateTime(columns[2].trim()),
                    "date_receipt": formatDateTime(columns[9].trim()),
                    "date_cancel": formatDateTime(columns[10].trim()),
                    "date_release": formatDateTime(columns[12].trim()),
                    "date_posted": '',
                    "date_filemtime": getDateTimeNow(),
                    "date_first_read": '0000-00-00 00:00:00',
                    "total_amount": '',
                    "total_amount_source": columns[8].trim(),
                    "status": columns[11].trim(),
                    "po_type": 0,
                    "poded_type": 9,
                    "order_type": '',
                    "tagging": '',
                    "label": '',
                    "payment_terms": '',
                    "remarks": '',
                    "type_tag": '',
                    "read_status": '',
                    "document_status": 1,
                    "from_file": 0,
                    "archive": 0,
                    "is_test": 0,
                    "unique_identifier": columns[0].trim()+"-"+columns[5].trim()+"-"+columns[4].trim()+"-"+columns[16].trim()+"-"+columns[6].trim(),
                    "posum_type": 1,
                    "company_code": columns[14].trim(),
                    "location_code": columns[15].trim(),
                    "date_added": getDateTimeNow(),
                    "date_updated": getDateTimeNow(),
                });
            });
            await queueService.addPOSumJob(json, "poSumQueue", "poSumJob");
        });
        await queueService.processPoSum("poSumQueue");

        res.status(200).json({message: "PO Summary. Data processed successfully"});
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

const formatDateTime = (strDate: any) => {
    const year = parseInt(strDate.substring(0, 2), 10) + 2000;
    const month = parseInt(strDate.substring(2, 4), 10) - 1; // Month is 0-indexed
    const day = parseInt(strDate.substring(4, 6), 10);
    const date = new Date(year, month, day);
    return formatDate(date);
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

const removeLastElementIfBlank = async (arr: any) => {
    if (arr.length > 0 && (arr[arr.length - 1] === '' || arr[arr.length - 1] === null || arr[arr.length - 1] === undefined)) {
      arr.pop();
    }
    return arr;
}

module.exports = { getVdrData, processPOAlloc, processPOSum };