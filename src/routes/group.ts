import route from 'express';
import {verifyClient} from "../middleware/client-validation";
import {
    addGroupController,
    deleteGroup,
    getAllGroupsController,
    getGroup,
    updateGroup
} from "../controller/routes/group";
const groupRouter = route.Router();

groupRouter.route('/')
    .post(verifyClient,addGroupController)
    .get(verifyClient,getAllGroupsController)

groupRouter.route('/:id')
    .get(verifyClient,getGroup)
    .delete(verifyClient,deleteGroup)
    .put(verifyClient,updateGroup)

export default groupRouter