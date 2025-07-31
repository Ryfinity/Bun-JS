const Database = require("../config/AsnConnection");
const BunConnection = require("../config/BunConnection")
const Queing = require("../services/Queing");
const S3Client = require("../services/AwsS3");
const Helpers = require("../helpers/global_function")
const fs = require('fs');
const https = require("https");
const pathDownload = "public/downloads/";

const processVdrdata = async (req: any, res: any) => {
    try {
        var selectquery = "";
        const [activity_log_row] = await BunConnection.query("SELECT * FROM activity_log WHERE log_name = 'VDR' AND properties != '' ORDER BY id DESC");

        if (activity_log_row.length) {
            var selectquery = `SELECT * FROM asn_vdr_data WHERE validation = 1 AND date_updated > '${Helpers.utcFormatDateTime(JSON.parse(activity_log_row[0].properties).date_updated)}' ORDER BY date_updated DESC`;
        } else {
            console.log('❌ No record in activity log')
            var selectquery = "SELECT * FROM asn_vdr_data WHERE validation = 1 ORDER BY date_updated DESC";
        }

        const [rows] = await Database.query(selectquery);
        if (rows.length === 0) {
            console.log("📑 No new VDR data to process");
            return false;
        }
        const rowsWithoutKey = Helpers.removeKeyFromObject(rows, "id");
        const chunkedData = Helpers.chunkingData(rowsWithoutKey, 500);

        const queing = new Queing();
        chunkedData.forEach(async (chunk: any) => {
            chunk.map((row: any) => {
                row.delivery_date = Helpers.formatDate(row.delivery_date);
                return row;
            });
            await queing.addJob(chunk, "vdrQueue", "vdrJob");
        });
        await queing.processVdrJob("vdrQueue");

        const [last_row] = await BunConnection.query(selectquery);
        const log: any = ["VDR", "ASN", "VDR Last Record Inserted", "Insert", JSON.stringify(last_row[0]), Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
        reacordActivityLog(log)

        return "VDR Data processed successfully"
    } catch {
        return "Internal Error"
    }
}

const processPOAlloc = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POALLOC.hsh");
    const txtFile = await Helpers.checkFileIfExist("POALLOC.txt");
    if (!txtFile && !shsFile) {
        console.log("❌ PO Alloc txt or hsh file not found");
        return "PO Alloc txt or hsh file not found";
    }
    const shsFilename = shsFile.split("/").slice(-1).pop();
    const txtFilename = txtFile.split("/").slice(-1).pop();

    const shsFileURL =  await S3.fileURL(shsFile, shsFilename);
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    const donwloadShsFile = Helpers.downloadShsFile(shsFileURL, shsFilename, pathDownload);

    https.get(txtFileURL, (res: any) => {
        const shsPath = pathDownload + shsFilename;
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing PO Alloc...");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);
                if (validateShsAndTxt === false) {
                    console.log("❌ PO Alloc SHS and TXT file length do not match.");
                    const log: any = ["PO Alloc", "ASN", "SHS and TXT file length do not match.", "Error", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    reacordActivityLog(log)
                    return;
                }
                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOAlloc(chunks);
                    await queing.addJob(arr, "poAllocQueue", "poAllocJob");
                });
                await queing.processPoAllocJob("poAllocQueue");  

                S3.deleteFile(shsFile, shsFilename);
                S3.deleteFile(txtFile, txtFilename);
                const log: any = ["POALLOC", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
   
    return "PO Alloc. Data processed successfully";
}

const processPOSum = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("posum.hsh");
    const txtFile = await Helpers.checkFileIfExist("posum.txt");
    if (!txtFile && !shsFile) {
        console.log("❌ PO Sum txt or hsh file not found");
        return "PO Sum txt or hsh file not found";
    }
    const shsFilename = shsFile.split("/").slice(-1).pop();
    const txtFilename = txtFile.split("/").slice(-1).pop();

    const shsFileURL =  await S3.fileURL(shsFile, shsFilename);
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    const donwloadShsFile = Helpers.downloadShsFile(shsFileURL, shsFilename, pathDownload);

    https.get(txtFileURL, (res: any) => {
        const shsPath = pathDownload + shsFilename;
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing PO Sum...");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);
                if (validateShsAndTxt === false) {
                    console.log("❌ PO Sum SHS and TXT file length do not match.");
                    const log: any = ["PO Sum", "ASN", "SHS and TXT file length do not match.", "Error", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    reacordActivityLog(log);
                    return;
                }
                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOSum(chunks);
                    await queing.addJob(arr, "poSumQueue", "poSumJob");
                });
                await queing.processPoSum("poSumQueue");  

                S3.deleteFile(shsFile, shsFilename);
                S3.deleteFile(txtFile, txtFilename);
                const log: any = ["POSUM", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    
    return "PO Summary. Data processed successfully";
}

const processPOAllocAff = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POALLOC_AFF.hsh");
    const txtFile = await Helpers.checkFileIfExist("POALLOC_AFF.txt");
    if (!txtFile && !shsFile) {
        console.log("❌ PO Alloc aff txt or hsh file not found");
        return "PO Alloc aff txt or hsh file not found";
    }
    const shsFilename = shsFile.split("/").slice(-1).pop();
    const txtFilename = txtFile.split("/").slice(-1).pop();

    const shsFileURL =  await S3.fileURL(shsFile, shsFilename);
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    const donwloadShsFile = Helpers.downloadShsFile(shsFileURL, shsFilename, pathDownload);

    https.get(txtFileURL, (res: any) => {
        const shsPath = pathDownload + shsFilename;
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing PO Alloc aff...");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);
                if (validateShsAndTxt === false) {
                    console.log("❌ PO Alloc aff SHS and TXT file length do not match.");
                    const log: any = ["PO Alloc aff", "ASN", "SHS and TXT file length do not match.", "Error", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    reacordActivityLog(log);
                    return;
                }
                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOAllocAff(chunks);
                    await queing.addJob(arr, "poAllocAffQueue", "poAllocAffJob");
                });
                await queing.processPoAllocAff("poAllocAffQueue");  

                S3.deleteFile(txtFile, txtFilename);
                S3.deleteFile(shsFile, shsFilename);
                const log: any = ["PO ALLOC AFF", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });

    return "PPO Aff. Data processed successfully";
}

const processPOSet = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POSET.hsh");
    const txtFile = await Helpers.checkFileIfExist("POSET.txt");
    if (!txtFile && !shsFile) {
        console.log("❌ PO Set txt or hsh file not found");
        return "PO Set txt or hsh file not found";
    }
    const shsFilename = shsFile.split("/").slice(-1).pop();
    const txtFilename = txtFile.split("/").slice(-1).pop();

    const shsFileURL =  await S3.fileURL(shsFile, shsFilename);
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    const donwloadShsFile = Helpers.downloadShsFile(shsFileURL, shsFilename, pathDownload);

    https.get(txtFileURL, (res: any) => {
        const shsPath = pathDownload + shsFilename;
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing PO Set...");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);
                if (validateShsAndTxt === false) {
                    console.log("❌ PO Set SHS and TXT file length do not match.");
                    const log: any = ["PO Set", "ASN", "SHS and TXT file length do not match.", "Error", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                    reacordActivityLog(log);
                    return;
                }
                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOSet(chunks);
                    await queing.addJob({"data": arr}, "poSetQueue", "poSetJob");
                });
                await queing.processPoSet("poSetQueue");  

                S3.deleteFile(txtFile, txtFilename);
                S3.deleteFile(shsFile, shsFilename);
                const log: any = ["PO SET", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    
    return "PO Prepack. Data processed successfully";
}

const processPODetails = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("podetl.hsh");
    const txtFile = await Helpers.checkFileIfExist("podetl.txt");
    if (!txtFile && !shsFile) {
        console.log("❌ PO Detail txt or hsh file not found");
        return "PO Detail txt or hsh file not found";
    }
    const shsFilename = shsFile.split("/").slice(-1).pop();
    const txtFilename = txtFile.split("/").slice(-1).pop();

    const shsFileURL =  await S3.fileURL(shsFile, shsFilename);
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    const donwloadShsFile = Helpers.downloadShsFile(shsFileURL, shsFilename, pathDownload);

    https.get(txtFileURL, (res: any) => {
        const shsPath = pathDownload + shsFilename;
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing PO Detl...");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);
                if (validateShsAndTxt === false) {
                    console.log("❌ PO Detail SHS and TXT file length do not match.");
                    const log: any = ["PO Detail", "ASN", "SHS and TXT file length do not match.", "Error", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()]
                    reacordActivityLog(log)
                    return;
                }
                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPODetails(chunks);
                    await queing.addJob({"data": arr}, "poDetlQueue", "poDetlJob");
                });
                await queing.processPoDetl("poDetlQueue");  

                S3.deleteFile(txtFile, txtFilename);
                S3.deleteFile(shsFile, shsFilename);
                const log: any = ["POSUM", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });
        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });

    return "PO Details. Data processed successfully";
}

const processRCRSum = async (req: any, res: any) => {
    const S3 = new S3Client();
    const txtFile = await Helpers.checkFileIfExist("RCRSUM.txt");
    if (!txtFile) {
        console.log("❌ RCRSUM file not found");
        return "RCRSUM file not found";
    }
    const txtFilename = txtFile.split("/").slice(-1).pop();
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    https.get(txtFileURL, (res: any) => {
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing RCRSUM...");

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processRCRSum(chunks);
                    await queing.addJob(arr, "rcrSumQueue", "rcrSumJob");
                });
                await queing.processRcrSum("rcrSumQueue");  

                S3.deleteFile(txtFile, txtFilename);
                const log: any = ["RCRSUM", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });
    });

    return "RCRSUM. Data processed successfully";
}

const processRCRDetl = async (req: any, res: any) => {
    const S3 = new S3Client();
    const txtFile = await Helpers.checkFileIfExist("RCRDTL.txt");
    if (!txtFile) {
        console.log("❌ RCRSUM file not found");
        return "RCRSUM file not found";
    }
    const txtFilename = txtFile.split("/").slice(-1).pop();
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    https.get(txtFileURL, (res: any) => {
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing RCRDTL...");

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processRCRDetl(chunks);
                    await queing.addJob(arr, "rcrDetlQueue", "rcrDetlJob");
                });
                await queing.processRcrDetl("rcrDetlQueue"); 

                S3.deleteFile(txtFile, txtFilename);
                const log: any = ["RCRDTL", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });
    });

    return "RCRDTL. Data processed successfully";
}

const processSCDRR = async (req: any, res: any) => {
    const S3 = new S3Client();
    const txtFile = await Helpers.checkFileIfExist("SCRDR.txt");
    if (!txtFile) {
        console.log("❌ RCRSUM file not found");
        return "SCDRR file not found";
    }
    const txtFilename = txtFile.split("/").slice(-1).pop();
    const txtFileURL =  await S3.fileURL(txtFile, txtFilename); 

    https.get(txtFileURL, (res: any) => {
        const txtPath = pathDownload + txtFilename;
        const writeStream = fs.createWriteStream(txtPath);
        res.pipe(writeStream);

        writeStream.on("finish", async () => {
            writeStream.close();
            console.log("⬇️  File downloaded successfully. Processing SCDRR...");

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processSCDRR(chunks);
                    await queing.addJob(arr, "scDrrQueue", "rcrDetlJob");
                });
                await queing.processScDrr("scDrrQueue");  

                S3.deleteFile(txtFile, txtFilename);
                const log: any = ["SCDRR", "ASN", "Filename: "+txtFilename+" has been removed to archive", "Delete", "", Helpers.getDateTimeNow(), Helpers.getDateTimeNow()];
                reacordActivityLog(log);
            });
        });
    });

    return "SCDRR. Data processed successfully";
}

const reacordActivityLog = async (details: []) => {
    const insertquery = `INSERT INTO activity_log (log_name, app_name, message, event, properties, created_at, updated_at)  VALUES (?, ?, ?, ?, ?, ?, ?)`
    const [record_activity_log] = await BunConnection.query(insertquery, details);
    return record_activity_log;
}

module.exports = { processVdrdata, processPOAlloc, processPOSum, processPOAllocAff, processPOSet, processPODetails, processRCRSum, processRCRDetl, processSCDRR };