const fs = require("fs");

const readFile = async (req: any, res: any) => {
    const filePath = "public/downloads/sample.txt";
    try {
        const data = fs.readFile(filePath, "utf8", (err: any, data: any) => {
            const json: any[] = [];
            if (err) {
                console.error("Error reading file:", err);
                res.status(500).send("Error reading file");
                return;
            }
            // Split the data into lines and process each line
            const lines = data.toString().split("\r\n");
            lines.forEach((line: any) => {
                // Process each line as needed
                json.push({
                    "col1": line.split("|")[0],
                    "col2": line.split("|")[1],
                    "col3": line.split("|")[3]
                })
            })

            const chunkSize = 2; // Define the chunk size
            const chunks = chunkData(json, chunkSize); // Split the data into chunks
            chunks.forEach((chunk: any, index: number) => {
                // Process each chunk as needed / dito ipapasok ang queing
                // console.log(`Chunk ${index + 1}:`, chunk);
            });
            res.send(chunks); // Send the chunks as a response if needed
        });
    } catch (error) {
        res.status(500).send("Internal Error");
    }
}

const chunkData = (data: any, chunkSize: number) => {
    const chunks: any[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
}

module.exports = { readFile };