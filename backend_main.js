import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import routes from './routes.js';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import multer from 'multer';
import path from 'path';
import fs from 'fs';



import {updateAdminsHoliday, updateStatusAbsensi} from './controller.js';
import xlsx from 'xlsx'; // Import the CommonJS module
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.use(session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


const uploadDir = './uploads';
// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'uploaded_file.xlsx'); // Rename the file to replace any existing one
    },
});

const upload = multer({ storage });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the uploaded Excel file
const excelFilePath = path.join(__dirname, 'uploads', 'uploaded_file.xlsx');


const searchRFIDInExcel = (rfid) => {
    // Use xlsx.readFile for CommonJS default import
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to JSON format for easier searching
    const rows = xlsx.utils.sheet_to_json(worksheet);

    // Search for the row where 'RFID' column matches, case insensitive
    const foundRow = rows.find(row => {
        // Check if the row has an 'RFID' property
        if (row.RFID !== undefined) {
            // Log the RFID values being compared
            //console.log(`Comparing: ${row.RFID.toString().toLowerCase()} with ${rfid.toLowerCase()}`);
            return row.RFID.toString().toLowerCase() === rfid.toLowerCase();
        }
        return false;
    });

    // Debugging: Log the found row or null
    console.log('Found Row:', foundRow);

    return foundRow || null;
};


// Create the GET route to search by RFID
app.get('/find-rfid/:rfid', (req, res) => {
    const rfid = req.params.rfid;

    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ message: 'File not found.' });
    }

    // Search the RFID in the Excel file
    const result = searchRFIDInExcel(rfid);

    if (result) {
        res.status(200).json( result );
    } else {
        res.status(404).json({ message: 'RFID not found.' });
    }
});


app.post('/upload-data-santri', upload.single('file'), (req, res) => {
    res.status(200).json({ message: 'File uploaded successfully.' });
});

app.get('/download-data-santri', (req, res) => {
    const filePath = path.join(uploadDir, 'uploaded_file.xlsx');
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'downloaded_file.xlsx');
    } else {
        res.status(404).json({ message: 'File not found.' });
    }
});



app.use('/', routes);

const jamUpdateAlpa = '02:20'; // HH:mm format
const [hour, minute] = jamUpdateAlpa.split(':');

cron.schedule(`${minute} ${hour} * * *`, async () => {
    console.log(`Running task at ${jamUpdateAlpa}`);
    await updateStatusAbsensi();
    await updateAdminsHoliday();

});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
