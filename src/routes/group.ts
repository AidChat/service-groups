import route from 'express';
import {verifyClient} from "../middleware/client-validation";
import {
    addGroupController, addUserToGroup, createRequest,
    deleteGroup,
    getAllGroups, getAllRequests,
    getGroup, GroupMembers, messages, removeRequest,
    updateGroup,getRequest
} from "../controller/routes/group";
const groupRouter = route.Router();

groupRouter.route('/')
    .post(verifyClient,addGroupController)
    .get(verifyClient,getAllGroups)

groupRouter.route('/:id')
    .get(verifyClient,getGroup)
    .delete(verifyClient,deleteGroup)
    .put(verifyClient,updateGroup)


groupRouter.route('/messages/:groupId')
    .get(verifyClient,messages)

groupRouter.route('/users/:id')
    .put(verifyClient,addUserToGroup)
    .get(verifyClient,GroupMembers)

groupRouter.route('/invite/:groupId')
    .post(verifyClient,createRequest)
    .get(verifyClient,getAllRequests)

groupRouter.route('/invite/:inviteId')
    .delete(verifyClient,removeRequest)


groupRouter.route('/request/:id')
    .get(getRequest)
    .put(verifyClient,addUserToGroup)
export default groupRouter