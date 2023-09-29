import route from 'express';
import {verifyClient} from "../middleware/client-validation";
import {addGroupController} from "../controller/routes/group";
const groupRouter = route.Router();

groupRouter.route('/')
    .post(verifyClient,addGroupController)

export default groupRouter