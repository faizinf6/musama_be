import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;
import session from 'express-session'
import routes from "./routes.js";
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.use(session({
    secret: 'rahasia', // Ganti dengan secret key Anda
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Untuk HTTPS gunakan `true`
}));

// app.get('/', async (req, res) => {
//     res.json({ status: true, message: "Berjalan Coooy!!" })
// });
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});