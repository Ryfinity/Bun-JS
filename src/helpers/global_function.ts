const S3Client = require("../services/AwsS3");
const https = require("https");
const fsPromises = require('fs').promises;
const fs = require("fs");
const BunConnection = require("../config/BunConnection")

module.exports = {
    chunkingData: function(data: [], size: number) {
        const chunks = [];
        for (let i = 0; i < data.length; i += size) {
            chunks.push(data.slice(i, i + size));
        }
        return chunks;
    },

    removeKeyFromObject: function(data: [], key: string) {
        return data.map((obj: any) => {
            const { [key]: _, ...rest } = obj; // Destructure to remove the key
            return rest;
        });
    },

    checkFileIfExist: async function(file: string) {
        const S3 = new S3Client();
        const files = await S3.listFiles();
        const filteredFiles = files.filter((f: any) => f.key.includes(file)).map((f: any) => f.key);
        if (filteredFiles.length == 0) {
            // console.log('No file found.')
            return false;
        }
        return filteredFiles[0];
    },

    downloadShsFile: function(url: string, filename: string, pathDownload: string) {
        https.get(url, (res: any) => {
            const path = pathDownload + filename;
            const writeStream = fs.createWriteStream(path);
            res.pipe(writeStream);

            writeStream.on("finish", () => {
                writeStream.close();
                // console.log("File downloaded successfully.");
            });

            writeStream.on("error", (err: any) => {
                console.error("Error writing file:", err);
            });
        });
    },

    calculateFileHash: async function(shsPath: string) {
        const data = await fsPromises.readFile(shsPath, "utf8");
        return data.split(",");
    },

    removeEmptyLine: function(data: string) {
        const lines = data.toString().split('\n').filter((line: any) => line.trim() !== '').join('\n');
        const split = lines.split("\r\n").length;
        return split;
    },

    validateShsDataAndTxtLength: function(shsData: number, txtData: number) {
        if (shsData != txtData) {
            return false;
        }
        return true;
    },

    getDateTimeNow: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    formatDateTime: function(date: string) {
        const year = parseInt(date.substring(0, 2), 10) + 2000;
        const month = parseInt(date.substring(2, 4), 10) - 1; // Month is 0-indexed
        const day = parseInt(date.substring(4, 6), 10);
        const todate = new Date(year, month, day);
        return this.formatDate(todate);
    },

    formatDate: function(date: any) {
        const dateObj = date.toLocaleDateString().split("/").reverse();
        return dateObj[0] + "-" + dateObj[2] + "-" + dateObj[1];
    },

    utcFormatDateTime: function(d: any) {
        const date = new Date(d);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    },

    reacordActivityLog: async function(details: []) {
        const insertquery = `INSERT INTO activity_log (log_name, app_name, message, event, properties, created_at, updated_at)  VALUES (?, ?, ?, ?, ?, ?, ?)`
        const [record_activity_log] = await BunConnection.query(insertquery, details);
        return record_activity_log;
    },

    processPOAlloc: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            arr.push({
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
                "date_added": this.getDateTimeNow(),
                "date_updated": this.getDateTimeNow(),
                "header_unique_identifier": columns[4].trim()+"-"+columns[0].trim()+"-"+columns[2].trim()+"-"+columns[10].trim()+"-"+columns[6].trim(),
                "detail_unique_identifier": columns[4].trim()+"-"+columns[0].trim()+"-"+columns[2].trim()+"-"+columns[10].trim()+"-"+columns[6].trim()+"-"+columns[8].trim()+"-"+columns[11].trim(),
                "unique_identifier": columns[4].trim()+"-"+columns[0].trim()+"-"+columns[2].trim()+"-"+columns[10].trim()+"-"+columns[6].trim()+"-"+columns[8].trim()+"-"+columns[11].trim()+"-"+columns[24].trim()
            });
        });
        return arr;
    },

    processPOSum: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            arr.push({
                // "id": columns[0].trim(),
                "vendor_code": columns[0].trim(),
                "department_code": columns[16].trim(),
                "sub_dept_code": 0,
                "vendor_name": columns[1].trim(),
                "company_name": columns[5].trim(),
                "document_no": columns[6].trim(),
                "reference_no": 0,
                "department_name": columns[3].trim(),
                "ship_to": columns[7].trim(),
                "location": columns[4].trim(),
                "date_entry": this.formatDateTime(columns[2].trim()),
                "date_receipt": this.formatDateTime(columns[9].trim()),
                "date_cancel": this.formatDateTime(columns[10].trim()),
                "date_release": this.formatDateTime(columns[12].trim()),
                "date_posted": this.getDateTimeNow(),
                "date_filemtime": this.getDateTimeNow(),
                "date_first_read": this.getDateTimeNow(),
                "total_amount": 0,
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
                "read_status": 0,
                "document_status": 1,
                "from_file": 0,
                "archive": 0,
                "is_test": 0,
                "unique_identifier": columns[1].trim()+"-"+columns[14].trim()+"-"+columns[15].trim()+"-"+columns[16].trim()+"-"+columns[6].trim(),
                "posum_type": 1,
                "company_code": columns[14].trim(),
                "location_code": columns[15].trim(),
                "date_added": this.getDateTimeNow(),
                "date_updated": this.getDateTimeNow(),
            });
        });
        return arr;
    },

    processPOAllocAff: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
        const columns = i.split("|");
            arr.push({
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
                "date_added": this.getDateTimeNow(),
                "date_updated": this.getDateTimeNow(),
                "header_unique_identifier": columns[2].trim()+"-"+columns[10].trim()+"-"+columns[23].trim()+"-"+columns[19].trim()+"-"+columns[12].trim(),
                "detail_unique_identifier": columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[27].trim()+"-"+columns[21].trim(),
                "unique_identifier": columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[2].trim()+"-"+columns[27].trim()+"-"+columns[21].trim()
            });
        });
        return arr;
    },

    processPOSet: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            arr.push({
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
                "entdte1": this.formatDateTime(columns[10].trim()),
                "ttag1": columns[11].trim(),
                "ordert1": columns[12].trim(),
                "recdte1": this.formatDateTime(columns[13].trim()),
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
                "date_added": this.getDateTimeNow(),
                "date_updated": this.getDateTimeNow(),
                "from_file": 1,
                "header_unique_identifier": columns[5].trim()+"-"+columns[1].trim()+"-"+columns[6].trim()+"-"+columns[8].trim()+"-"+columns[4].trim(),
                "unique_identifier": columns[5].trim()+"-"+columns[1].trim()+"-"+columns[6].trim()+"-"+columns[8].trim()+"-"+columns[4].trim()+"-"+columns[21].trim()+"-"+columns[9].trim()+"-"+columns[39].trim(),
            });
        });
        return arr;
    },

    processPODetails: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            arr.push({
                // "id": 1,
                "povnum": columns[0].trim(),
                "ponumb": columns[1].trim(),
                "recdte": this.formatDateTime(columns[2].trim()),
                "candte": this.formatDateTime(columns[3].trim()),
                "entdte": this.formatDateTime(columns[4].trim()),
                "ttag": columns[5].trim(),
                "label": columns[6].trim(),
                "podpt": columns[7].trim(),
                "posdpt": columns[8].trim(),
                "ordert": columns[9].trim(),
                "asname": columns[10].trim(),
                "dptnam": columns[11].trim(),
                "strnam": columns[12].trim(),
                "shpto": columns[13].trim(),
                "glcnam": columns[14].trim(),
                "tmpdsc": columns[15].trim(),
                "tbldsc": columns[16].trim(),
                "inumbr": columns[17].trim(),
                "ides50": columns[18].trim(),
                "iclas": columns[19].trim(),
                "iupc": parseInt(columns[20].trim()),
                "pobqty": columns[21].trim(),
                "pobcst": columns[22].trim(),
                "pomum": columns[23].trim(),
                "pomret": columns[24].trim(),
                "iumdsc": columns[25].trim(),
                "postyl": columns[26].trim(),
                "sstyle": columns[27].trim(),
                "pgsku": columns[28].trim(),
                "pgsz1": columns[29].trim(),
                "pgsz2": columns[30].trim(),
                "pgsz3": columns[31].trim(),
                "pgsz4": columns[32].trim(),
                "pgsz5": columns[33].trim(),
                "pgsz6": columns[34].trim(),
                "pgsz7": columns[35].trim(),
                "pgsz8": columns[36].trim(),
                "pgsz9": columns[37].trim(),
                "pgsz10": columns[38].trim(),
                "pgsz11": columns[39].trim(),
                "pgsz12": columns[40].trim(),
                "pgsz13": columns[41].trim(),
                "pgsz14": columns[42].trim(),
                "pgsz15": columns[43].trim(),
                "pgcol1": columns[44].trim(),
                "pgcol2": columns[45].trim(),
                "pgcol3": columns[46].trim(),
                "pgcol4": columns[47].trim(),
                "pgcol5": columns[48].trim(),
                "pgcol6": columns[49].trim(),
                "pgcol7": columns[50].trim(),
                "pgqt11": columns[51].trim(),
                "pgqt12": columns[52].trim(),
                "pgqt13": columns[53].trim(),
                "pgqt14": columns[54].trim(),
                "pgqt15": columns[55].trim(),
                "pgqt16": columns[56].trim(),
                "pgqt17": columns[57].trim(),
                "pgqt18": columns[58].trim(),
                "pgqt19": columns[59].trim(),
                "pgqt1a": columns[60].trim(),
                "pgqt1b": columns[61].trim(),
                "pgqt1c": columns[62].trim(),
                "pgqt1d": columns[63].trim(),
                "pgqt1e": columns[64].trim(),
                "pgqt1f": columns[65].trim(),
                "pgqt21": columns[66].trim(),
                "pgqt22": columns[67].trim(),
                "pgqt23": columns[68].trim(),
                "pgqt24": columns[69].trim(),
                "pgqt25": columns[70].trim(),
                "pgqt26": columns[71].trim(),
                "pgqt27": columns[72].trim(),
                "pgqt28": columns[73].trim(),
                "pgqt29": columns[74].trim(),
                "pgqt2a": columns[75].trim(),
                "pgqt2b": columns[76].trim(),
                "pgqt2c": columns[77].trim(),
                "pgqt2d": columns[78].trim(),
                "pgqt2e": columns[79].trim(),
                "pgqt2f": columns[80].trim(),
                "pgqt31": columns[81].trim(),
                "pgqt32": columns[82].trim(),
                "pgqt33": columns[83].trim(),
                "pgqt34": columns[84].trim(),
                "pgqt35": columns[85].trim(),
                "pgqt36": columns[86].trim(),
                "pgqt37": columns[87].trim(),
                "pgqt38": columns[88].trim(),
                "pgqt39": columns[89].trim(),
                "pgqt3a": columns[90].trim(),
                "pgqt3b": columns[91].trim(),
                "pgqt3c": columns[92].trim(),
                "pgqt3d": columns[93].trim(),
                "pgqt3e": columns[94].trim(),
                "pgqt3f": columns[95].trim(),
                "pgqt41": columns[96].trim(),
                "pgqt42": columns[97].trim(),
                "pgqt43": columns[98].trim(),
                "pgqt44": columns[99].trim(),
                "pgqt45": columns[100].trim(),
                "pgqt46": columns[101].trim(),
                "pgqt47": columns[102].trim(),
                "pgqt48": columns[103].trim(),
                "pgqt49": columns[104].trim(),
                "pgqt4a": columns[105].trim(),
                "pgqt4b": columns[106].trim(),
                "pgqt4c": columns[107].trim(),
                "pgqt4d": columns[108].trim(),
                "pgqt4e": columns[109].trim(),
                "pgqt4f": columns[110].trim(),
                "pgqt51": columns[111].trim(),
                "pgqt52": columns[112].trim(),
                "pgqt53": columns[113].trim(),
                "pgqt54": columns[114].trim(),
                "pgqt55": columns[115].trim(),
                "pgqt56": columns[116].trim(),
                "pgqt57": columns[117].trim(),
                "pgqt58": columns[118].trim(),
                "pgqt59": columns[119].trim(),
                "pgqt5a": columns[120].trim(),
                "pgqt5b": columns[121].trim(),
                "pgqt5c": columns[122].trim(),
                "pgqt5d": columns[123].trim(),
                "pgqt5e": columns[124].trim(),
                "pgqt5f": columns[125].trim(),
                "pgqt61": columns[126].trim(),
                "pgqt62": columns[127].trim(),
                "pgqt63": columns[128].trim(),
                "pgqt64": columns[129].trim(),
                "pgqt65": columns[130].trim(),
                "pgqt66": columns[131].trim(),
                "pgqt67": columns[132].trim(),
                "pgqt68": columns[133].trim(),
                "pgqt69": columns[134].trim(),
                "pgqt6a": columns[135].trim(),
                "pgqt6b": columns[136].trim(),
                "pgqt6c": columns[137].trim(),
                "pgqt6d": columns[138].trim(),
                "pgqt6e": columns[139].trim(),
                "pgqt6f": columns[140].trim(),
                "pgqt71": columns[141].trim(),
                "pgqt72": columns[142].trim(),
                "pgqt73": columns[143].trim(),
                "pgqt74": columns[144].trim(),
                "pgqt75": columns[145].trim(),
                "pgqt76": columns[146].trim(),
                "pgqt77": columns[147].trim(),
                "pgqt78": columns[148].trim(),
                "pgqt79": columns[149].trim(),
                "pgqt7a": columns[150].trim(),
                "pgqt7b": columns[151].trim(),
                "pgqt7c": columns[152].trim(),
                "pgqt7d": columns[153].trim(),
                "pgqt7e": columns[154].trim(),
                "pgqt7f": columns[155].trim(),
                "note1": columns[156].trim(),
                "note2": columns[157].trim(),
                "ordby": columns[158].trim(),
                "buynam": columns[159].trim(),
                "apvby": columns[160].trim(),
                "stat": (columns[161].trim().toLowerCase() == 'released') ? 'PENDING' : columns[161].trim(),
                "potype": columns[162].trim(),
                "pocost": columns[163].trim(),
                "poretl": columns[164].trim(),
                "pocmt1": columns[165].trim(),
                "pocmt2": columns[166].trim(),
                "pocmt3": columns[167].trim(),
                "netbc": columns[168].trim(),
                "extcst": columns[169].trim(),
                "extret": columns[170].trim(),
                "dis1": columns[171].trim(),
                "dis2": columns[172].trim(),
                "dis3": columns[173].trim(),
                "dis4": columns[174].trim(),
                "dis5": columns[175].trim(),
                "dis6": columns[176].trim(),
                "dis7": columns[177].trim(),
                "dis8": columns[178].trim(),
                "dis9": columns[179].trim(),
                "dis10": columns[180].trim(),
                "dis11": columns[181].trim(),
                "dis12": columns[182].trim(),
                "dis13": columns[183].trim(),
                "dis14": columns[184].trim(),
                "dis15": columns[185].trim(),
                "dis16": columns[186].trim(),
                "dis17": columns[187].trim(),
                "dis18": columns[188].trim(),
                "dis19": columns[189].trim(),
                "dis20": columns[190].trim(),
                "tag": columns[191].trim(),
                "isclas": columns[192].trim(),
                "ivndp": columns[193].trim(),
                "rcnot1": columns[194].trim(),
                "refno": columns[195].trim(),
                "po_id":"",
                "date_added": this.getDateTimeNow(),
                "date_updated": this.getDateTimeNow(),
                "podetl_type": 1,
                "header_unique_identifier": columns[0].trim()+"-"+columns[196].trim()+"-"+columns[197].trim()+"-"+columns[7].trim()+"-"+columns[1].trim(),
                "unique_identifier": columns[1].trim()+"-"+columns[196].trim()+"-"+columns[197].trim()+"-"+columns[7].trim()+"-"+columns[1].trim()+"-"+columns[17].trim()+"-"+columns[8].trim()+"-"+parseInt(columns[20].trim()),
                "from_file": 0,
                "glcpmn": columns[196].trim(),
                "strnum": columns[197].trim(),
                "potydsc": columns[198].trim()
            });
        });
        return arr;
    },

    processRCRSum: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0)
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            if (columns[0].trim() == '0' || columns[0].trim() == null || columns[0].trim() == undefined || columns[0].trim() == '') {
                this.reacordActivityLog(['RCR Summary', 'SHS', 'RCR Summary has no vendor code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            } 
            if (columns[3].trim() == '0' || columns[3].trim() == null || columns[3].trim() == undefined || columns[3].trim() == '') {
                this.reacordActivityLog(['RCR Summary', 'SHS', 'RCR Summary has no company code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[5].trim() == '0' || columns[5].trim() == null || columns[5].trim() == undefined || columns[5].trim() == '') {
                this.reacordActivityLog(['RCR Summary', 'SHS', 'RCR Summary has no branch code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[10].trim() == '0' || columns[10].trim() == null || columns[10].trim() == undefined || columns[10].trim() == '') {
                this.reacordActivityLog(['RCR Summary', 'SHS', 'RCR Summary has no RCR number', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            } 
            if (columns[8].trim() == '0' || columns[8].trim() == null || columns[8].trim() == undefined || columns[8].trim() == '') {
                this.reacordActivityLog(['RCR Summary', 'SHS', 'RCR Summary has no PO number', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            arr.push({
                "vendor_code": columns[0].trim(),
                "vendor_name": columns[1].trim(),
                "receipt_date": columns[2].trim(),
                "company_code": columns[3].trim(),
                "company_name": columns[4].trim(),
                "branch_code": columns[5].trim(),
                "store_name": columns[6].trim(),
                "invoice_number": columns[7].trim(),
                "po_number": columns[8].trim(),
                "po_cost": parseInt(columns[9].trim()) / 10000,
                "rcr_number": columns[10].trim(),
                "quantity_ordered": columns[11].trim(),
                "quantity_delivered": columns[12].trim()
            });
        });
        const filteredArray = arr.filter(item => item.vendor_code !== '0' && item.vendor_code !== null && item.vendor_code !== undefined  && item.vendor_code !== '');
        return arr;
    },

    processRCRDetl: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0);
        newArr.forEach((i: any) => {
            const columns = i.split("|");
            if (columns[4].trim() == '0' || columns[4].trim() == null || columns[4].trim() == undefined || columns[4].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no vendor code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[0].trim() == '0' || columns[0].trim() == null || columns[0].trim() == undefined || columns[0].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no company code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[2].trim() == '0' || columns[2].trim() == null || columns[2].trim() == undefined || columns[2].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no branch code', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[15].trim() == '0' || columns[15].trim() == null || columns[15].trim() == undefined || columns[15].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no RCR number', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[14].trim() == '0' || columns[14].trim() == null || columns[14].trim() == undefined || columns[14].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no PO number', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[6].trim() == '0' || columns[6].trim() == null || columns[6].trim() == undefined || columns[6].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no SKU', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[8].trim() == '0' || columns[8].trim() == null || columns[8].trim() == undefined || columns[8].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no UPC', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            if (columns[21].trim() == '0' || columns[21].trim() == null || columns[21].trim() == undefined || columns[21].trim() == '') {
                this.reacordActivityLog(['RCR Details', 'SHS', 'RCR Details has no quantity ordered', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
            }
            arr.push({
                "company_code": columns[0].trim(),
                "company_name": columns[1].trim(),
                "branch_code": columns[2].trim(),
                "store_name": columns[3].trim(),
                "vendor_code": columns[4].trim(),
                "vendor_name": columns[5].trim(),
                "dept_code": columns[6].trim(),
                "dept_name": columns[7].trim(),
                "subdept_code": columns[8].trim(),
                "number_of_cartons": parseInt(columns[9].trim()),
                "type_of_tag": columns[10].trim(),
                "terms_discount": columns[11].trim(),
                "order_type": columns[12].trim(),
                "label": columns[13].trim(),
                "po_number": columns[14].trim(),
                "rcr_number": columns[15].trim(),
                "invoice_number": columns[16].trim(),
                "delivery_date": columns[17].trim(),
                "cancel_date": columns[18].trim(),
                "class": columns[19].trim(),
                "subclass": columns[20].trim(),
                "sku": columns[21].trim(),
                "description": parseInt(columns[22].trim()),
                "vendor_part": columns[23].trim(),
                "upc": columns[24].trim(),
                "buy_qty": columns[25].trim(),
                "quantity_ordered": columns[26].trim(),
                "quantity_delivered": columns[27].trim(),
                "buy_um": columns[28].trim(),
                "unit_retail": columns[29].trim(),
                "sell_um": columns[30].trim(),
                "total_buy_qty": columns[31].trim(),
                "total_quantity_ordered": columns[32].trim(),
                "total_quantity_delivered": columns[33].trim(),
                "po_notes": columns[34].trim(),
                "rec_notes": parseInt(columns[35].trim()),
                "po_notes2": columns[36].trim(),
                "ordered_by": columns[37].trim(),
                "proc_by": columns[38].trim(),
                "style_number": columns[39].trim(),
                "style_description": columns[40].trim(),
            });
        });
        return arr;
    },

    processSCDRR: function(data: []) {
        const arr: any[] = [];
        const newArr = data.filter((obj: any) => Object.keys(obj).length > 0);

        newArr.forEach((i: any) => {
            const columns = i.split("|");
            if (columns.length < 7) {
                this.reacordActivityLog(['SCDRR', 'SHS', 'SCDRR has less than 7 columns', 'Error', JSON.stringify(columns), this.getDateTimeNow(), this.getDateTimeNow()]);
                return;
            }  
            arr.push({
                "store_code": parseInt(columns[0].trim()),
                "vendor_code": parseInt(columns[1].trim()),
                "dept_code": parseInt(columns[2].trim()),
                "subdept_code": parseInt(columns[3].trim()),
                "class_code": parseInt(columns[4].trim()),
                "dr_number": parseInt(columns[5].trim()),
                "post_date": parseInt(columns[6].trim()),
            });
        });
        return arr;
    }
}