import dotenv from 'dotenv';
import server from 'express';
import groupRouter from './routes/group'
import {config} from "./utils/appConfig";
import cors from 'cors';

const app = server()
app.use(cors())
app.use(server.json());
dotenv.config();
const port = process.env.PORT;

app.use(config._urlParser('/group'), groupRouter);
app.listen(port, () => {
    console.log(port,'Group-Service is running  💥')
})

