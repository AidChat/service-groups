import route from 'express';
import {verifyClient} from "../middleware/client-validation";
import {
    addGroup,
    addUserToGroup,
    createRequest,
    deleteGroup,
    getAllGroups,
    getAllRequests,
    getGroup,
    GroupMembers,
    messages,
    removeRequest,
    updateGroup,
    getRequest,
    createGroupDeleteRequest,
    getRole,
    removeUserFromGroup,
    getRequestByUser,
    updateRequestStatus, search
} from "../controller/routes/group";
import {
    addReminder,
    blockReminder,
    getReminderByGroup,
    getReminderById,
    removeReminder
} from "../controller/routes/reminder";

const groupRouter = route.Router();


groupRouter.route('/reminder/:reminderId')
    .delete(verifyClient,removeReminder)
    .get(verifyClient,getReminderById)

groupRouter.route('/reminders/:groupId')
    .get(verifyClient,getReminderByGroup)
    .post(verifyClient,addReminder)

groupRouter.route('/restrictReminder/:reminderId')
    .put(verifyClient,blockReminder)

groupRouter.route('/requests')
    .get(verifyClient, getRequestByUser)

groupRouter.route('/search')
    .post(verifyClient,search)


groupRouter.route('/messages/:groupId')
    .post(verifyClient, messages)

groupRouter.route('/users/:id')
    .put(verifyClient, addUserToGroup)
    .get(verifyClient, GroupMembers)

groupRouter.route('/invite/:groupId')
    .post(verifyClient, createRequest)
    .get(verifyClient, getAllRequests)

groupRouter.route('/invite/:requestId')
    .delete(verifyClient, removeRequest)
    .put(verifyClient,updateRequestStatus)

groupRouter.route('/request/:id')
    .get(getRequest)
    .put(verifyClient, addUserToGroup)

groupRouter.route('/role/:id')
    .get(verifyClient, getRole)

groupRouter.route('/remove/:id')
    .put(verifyClient, removeUserFromGroup)

groupRouter.route('/:id')
    .get(verifyClient, getGroup)
    .delete(verifyClient, deleteGroup)
    .put(verifyClient, updateGroup)
    .post(verifyClient, createGroupDeleteRequest)

groupRouter.route('/')
    .post(verifyClient, addGroup)
    .get(verifyClient, getAllGroups)



export default groupRouter