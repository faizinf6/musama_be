import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import routes from './routes.js';
import cron from 'node-cron';
import {updateAdminsHoliday, updateStatusAbsensi, updateStatusAbsensiPerbulan} from './controller.js';
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

app.use('/', routes);

const jamUpdateAlpa = '01:59'; // HH:mm format
const [hour, minute] = jamUpdateAlpa.split(':');

cron.schedule(`${minute} ${hour} * * *`, async () => {
    console.log(`Running task at ${jamUpdateAlpa}`);
    await updateStatusAbsensi();
    await updateAdminsHoliday();

});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
