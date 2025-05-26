const Database = require("../config/AsnConnection");
const Queing = require("../services/Queing");
const S3Client = require("../services/AwsS3");
const Helpers = require("../helpers/global_function")
const fs = require('fs');
const https = require("https");
const pathDownload = "public/downloads/";

const processVdrdata = async (req: any, res: any) => {
    try {
        const [rows] = await Database.query("SELECT * FROM asn_vdr_data WHERE validation = 1 LIMIT 1");

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
        res.status(200).json({message: "Data processed successfully"});
    } catch {
        res.status(500).send("Internal Error");
    }
}

const processPOAlloc = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POALLOC.hsh");
    const txtFile = await Helpers.checkFileIfExist("POALLOC.txt");

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
            console.log("File downloaded successfully.");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOAlloc(chunks);
                    await queing.addJob(arr, "poAllocQueue", "poAllocJob");
                });
                await queing.processPoAllocJob("poAllocQueue");  
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    res.status(200).json({message: "PO Allocation. Data processed successfully"});
}

const processPOSum = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("posum.hsh");
    const txtFile = await Helpers.checkFileIfExist("posum.txt");

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
            console.log("File downloaded successfully.");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOSum(chunks);
                    await queing.addJob(arr, "poSumQueue", "poSumJob");
                });
                await queing.processPoSum("poSumQueue");  
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    res.status(200).json({message: "PO Summary. Data processed successfully"});
}

const processPOAllocAff = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POALLOC_AFF.hsh");
    const txtFile = await Helpers.checkFileIfExist("POALLOC_AFF.txt");

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
            console.log("File downloaded successfully.");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOAllocAff(chunks);
                    await queing.addJob(arr, "poAllocAffQueue", "poAllocAffJob");
                });
                await queing.processPoAllocAff("poAllocAffQueue");  
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    res.status(200).json({message: "PO Aff. Data processed successfully"});
}

const processPOSet = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("POSET.hsh");
    const txtFile = await Helpers.checkFileIfExist("POSET.txt");

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
            console.log("File downloaded successfully.");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPOSet(chunks);
                    await queing.addJob({"data": arr}, "poSetQueue", "poSetJob");
                });
                await queing.processPoSet("poSetQueue");  
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    res.status(200).json({message: "PO Prepack. Data processed successfully"});
}

const processPODetails = async (req: any, res: any) => {
    const S3 = new S3Client();
    const shsFile = await Helpers.checkFileIfExist("podetl.hsh");
    const txtFile = await Helpers.checkFileIfExist("podetl.txt");

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
            console.log("File downloaded successfully.");

            const shsData = await Helpers.calculateFileHash(shsPath);

            fs.readFile(txtPath, "utf8", async (err: any, data: any) => {
                const removeEmptyLine = Helpers.removeEmptyLine(data);
                const validateShsAndTxt = Helpers.validateShsDataAndTxtLength(shsData[0], removeEmptyLine);

                const lines = await data.toString().split("\r\n");
                const chunkSize = 500;
                const chunkData = Helpers.chunkingData(lines, chunkSize);

                const queing = new Queing();
                chunkData.forEach(async (chunks: any) => {
                    const arr = Helpers.processPODetails(chunks);
                    await queing.addJob({"data": arr}, "poDetlQueue", "poDetlJob");
                });
                await queing.processPoDetl("poDetlQueue");  
            });
        });

        writeStream.on("error", (err: any) => {
            console.error("Error writing file:", err);
        });
    });
    res.status(200).json({message: "PO Details. Data processed successfully"});
}

module.exports = { processVdrdata, processPOAlloc, processPOSum, processPOAllocAff, processPOSet, processPODetails };