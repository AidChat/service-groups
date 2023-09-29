import dotenv from 'dotenv';
import server from 'express';
import groupRouter from './routes/group'
import {config} from "./utils/appConfig";

const app = server()
app.use(server.json());
dotenv.config();
const port = process.env.PORT;

console.log(process.env.KEY)
app.use(config._urlParser('/group'), groupRouter);
app.listen(port, () => {
    console.log('Group-Service is running  💥')
})

