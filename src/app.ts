import dotenv from 'dotenv';
import server from 'express';
import groupRouter from './routes/group'
import {config} from "./utils/appConfig";
import cors from 'cors';
import {v2 as cloudinary} from 'cloudinary';

const app = server()
app.use(server.json({limit: '50mb'}));
app.use(server.urlencoded({limit: '50mb'}));

app.use(cors())
app.use(server.json());
dotenv.config();
const port = process.env.PORT;


cloudinary.config({
    cloud_name: 'marcrove',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(config._urlParser('/group'), groupRouter);
app.listen(port, () => {
    console.log(port,'Group-Service is running  💥')
})

