const database = require("../config/asn_connection");
const QueueService = require("../services/queue");
const fs = require('fs');
const fsPromises = require('fs').promises;
const S3Client = require("../services/s3");
const https = require("https");

const getVdrData = async (req: any, res: any) => {
    try {
        const [rows] = await database.query("SELECT * FROM asn_vdr_data");

        const chunkSize = 500; // Define the chunk size
        const removeKey = "id"; // Define the key to be removed from each object
        const rowsWithoutKey = removeKeyFromObjects(rows, removeKey); // Remove the key from each object
        const chunkedData = chunkData(rowsWithoutKey, chunkSize); // Chunk the data
        
        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            item.map((row: any) => {
                row.delivery_date = formatDate(row.delivery_date);
                return row;
            });
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
    
    await new Promise((resolve) => setTimeout(resolve, 40000));

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
    
    await new Promise((resolve) => setTimeout(resolve, 40000));

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

const processPOAllocAff = async (req: any, res: any) => {
    const awsS3 = new S3Client();
    const files = await awsS3.listFiles();
    const filteredFiles = files.filter((file: any) => file.key.includes("POALLOC_AFF.hsh") || file.key.includes("POALLOC_AFF.txt")).map((file: any) => file.key);
    
    if (filteredFiles[1]) {
        var file2 = filteredFiles[1];
        await awsS3.downloadFile(file2, file2.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    if (filteredFiles[0]) {
        var file1 = filteredFiles[0];
        await awsS3.downloadFile(file1, file1.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 40000));

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
        console.log(parseInt(hashValue[0])+"-"+parseInt(removeLine.split("\r\n").length));
        if (parseInt(hashValue[0]) != parseInt(removeLine.split("\r\n").length)) {
            console.log("Cannot be process due to different length");
            res.status(200).json({message: "Cannot be process due to different length"});
            return;
        }
        const chunkSize = 500;
        const chunkedData = chunkData(lines, chunkSize);
        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            const json: any[] = [];
            const newItem = item.filter((obj: any) => Object.keys(obj).length > 0)
            newItem.forEach((i: any) => {
                const columns = i.split("|");
                json.push({
                    "poloc": columns[0].trim(),
                    "strnam": columns[1].trim(),
                    "povnum": columns[2].trim(),
                    "asname": columns[3].trim(),
                    "gt2fd1": columns[4].trim(),
                    "gt2fd2": columns[5].trim(),
                    "gt2fd3": columns[6].trim(),
                    "gt2fd4": columns[7].trim(),
                    "gt2fd5": columns[8].trim(),
                    "gt2fd6": columns[9].trim(),
                    "stcomp": columns[10].trim(),
                    "glcnam": columns[11].trim(),
                    "ponumb": columns[12].trim(),
                    "pobon": columns[13].trim(),
                    "posdat": columns[14].trim(),
                    "poedat": columns[15].trim(),
                    "pocdat": columns[16].trim(),
                    "buycde": columns[17].trim(),
                    "buynam": columns[18].trim(),
                    "podpt": columns[19].trim(),
                    "dptnam": columns[20].trim(),
                    "posdpt": columns[21].trim(),
                    "sdptnm": columns[22].trim(),
                    "postor": columns[23].trim(),
                    "whsshn": columns[24].trim(),
                    "ascurc": columns[25].trim(),
                    "aacont": columns[26].trim(),
                    "inumbr": columns[27].trim(),
                    "idescrp": columns[28].trim(),
                    "buyum": columns[29].trim(),
                    "sellum": columns[30].trim(),
                    "pomret": columns[31].trim(),
                    "pomcst": columns[32].trim(),
                    "pomqtycs": columns[33].trim(),
                    "totqtycs": columns[34].trim(),
                    "pomqty": columns[35].trim(),
                    "totqty": columns[36].trim(),
                    "pomrec": columns[37].trim(),
                    "totrec": columns[38].trim(),
                    "extret": columns[39].trim(),
                    "totexret": columns[40].trim(),
                    "extcst": columns[41].trim(),
                    "totexcst": columns[42].trim(),
                    "g1igmp": columns[43].trim(),
                    "sstylq": columns[44].trim(),
                    "sstyl": columns[45].trim(),
                    "ponot1": columns[46].trim(),
                    "ponot2": columns[47].trim(),
                    "ponot3": columns[48].trim(),
                    "date_added": getDateTimeNow(),
                    "date_updated": getDateTimeNow(),
                    "header_unique_identifier": columns[0].trim()+"-"+columns[5].trim()+"-"+columns[4].trim()+"-"+columns[16].trim()+"-"+columns[6].trim(),
                    "detail_unique_identifier": columns[0].trim()+"-"+columns[5].trim()+"-"+columns[4].trim()+"-"+columns[16].trim()+"-"+columns[6].trim(),
                    "unique_identifier": columns[0].trim()+"-"+columns[5].trim()+"-"+columns[4].trim()+"-"+columns[16].trim()+"-"+columns[6].trim()
                });
            });
            await queueService.addPOAllocAffJob(json, "poAllocAffQueue", "poAllocAffJob");
        });
        await queueService.processPoAllocAff("poAllocAffQueue");

        res.status(200).json({message: "PO Alloc Aff Summary. Data processed successfully"});
    });
}

const processPOSet = async (req: any, res: any) => {
    const awsS3 = new S3Client();
    const files = await awsS3.listFiles();
    const filteredFiles = files.filter((file: any) => file.key.includes("POSET.hsh") || file.key.includes("POSET.txt")).map((file: any) => file.key);

    if (filteredFiles[1]) {
        var file2 = filteredFiles[1];
        await awsS3.downloadFile(file2, file2.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    if (filteredFiles[0]) {
        var file1 = filteredFiles[0];
        await awsS3.downloadFile(file1, file1.split("/").slice(-1).pop());   
    } else {
        console.log("No file found");
        res.status(200).json({message: "No file found"});
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 40000));

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
        console.log(parseInt(hashValue[0])+"-"+parseInt(removeLine.split("\r\n").length));
        if (parseInt(hashValue[0]) != parseInt(removeLine.split("\r\n").length)) {
            console.log("Cannot be process due to different length");
            res.status(200).json({message: "Cannot be process due to different length"});
            return;
        }
        const chunkSize = 500;
        const chunkedData = chunkData(lines, chunkSize);
        
        const queueService = new QueueService();
        chunkedData.forEach(async (item) => {
            const json: any[] = [];
            const newItem = item.filter((obj: any) => Object.keys(obj).length > 0)
            newItem.forEach((i: any) => {
                const columns = i.split("|");
                json.push({
                    "asname1": columns[0].trim(),
                    "glcmpn": columns[1].trim(),
                    "glcnam1": columns[2].trim(),
                    "dptnam1": columns[3].trim(),
                    "ponumb": columns[4].trim(),
                    "povnum": columns[5].trim(),
                    "strnum": columns[6].trim(),
                    "strnam1": columns[7].trim(),
                    "podpt": columns[8].trim(),
                    "posdpt": columns[9].trim(),
                    "entdte1": formatDateTime(columns[10].trim()),
                    "ttag1": columns[11].trim(),
                    "ordert1": columns[12].trim(),
                    "recdte1": formatDateTime(columns[13].trim()),
                    "tmpdsc1": columns[14].trim(),
                    "label1": columns[15].trim(),
                    "candte1": columns[16].trim(),
                    "ordby1": columns[17].trim(),
                    "buynam1": columns[18].trim(),
                    "pocost": columns[19].trim(),
                    "poretl": columns[20].trim(),
                    "inumber": columns[21].trim(),
                    "ides50": columns[22].trim(),
                    "islum": columns[23].trim(),
                    "ibyum": columns[24].trim(),
                    "pomret": columns[25].trim(),
                    "pobcst": columns[26].trim(),
                    "netbc": columns[27].trim(),
                    "qtycd": columns[28].trim(),
                    "pobqty": columns[29].trim(),
                    "qtyrc": columns[30].trim(),
                    "extcst": columns[31].trim(),
                    "extret": columns[32].trim(),
                    "totcs": columns[33].trim(),
                    "totpcs": columns[34].trim(),
                    "totrc": columns[35].trim(),
                    "netcst": columns[36].trim(),
                    "netret": columns[37].trim(),
                    "isppid": columns[38].trim(),
                    "icmpno": columns[39].trim(),
                    "idsc50": columns[40].trim(),
                    "cslum": columns[41].trim(),
                    "cbyum": columns[42].trim(),
                    "unret": columns[43].trim(),
                    "isetqt": columns[44].trim(),
                    "setpcs": columns[45].trim(),
                    "ecmrtl": columns[46].trim(),
                    "tsetqt": columns[47].trim(),
                    "iupc": columns[48].trim(),
                    "tbcost": columns[49].trim(),
                    "date_added": getDateTimeNow(),
                    "date_updated": getDateTimeNow(),
                    "from_file": 1,
                    "header_unique_identifier": 'HDR-RP-001',
                    "unique_identifier": columns[5].trim()+"-"+columns[2].trim()+"-"+columns[6].trim()+"-"+columns[3].trim(),
                });
            });
            // res.status(200).json({"data": json });
            await queueService.addPOSetJob({"data": json }, "poSetQueue", "poSetJob");
        });
        await queueService.processPoSet("poSetQueue");

        res.status(200).json({message: "PO Set. Data processed successfully"});
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

module.exports = { getVdrData, processPOAlloc, processPOSum, processPOAllocAff, processPOSet };