import {Request, Response} from "express";
import {config} from "../../utils/appConfig";
import {responseHandler} from "../../utils/response-handler";

export async function getReminderByGroup(request: Request, response: Response) {
    try {
        let userId = request.body.user.user_id;
        let groupId = Number.parseInt(request.params.groupId);
        let reminders = await config._query.reminder.findMany({
            where: {
                groupId: groupId,
                OR: [
                    {
                        createdById: userId
                    },
                    {
                        participants: {
                                users: {
                                    some: {
                                        id: parseInt(userId)
                                    }
                                }
                        }
                    }
                ]
            },
            include: {
                participants: {
                    include: {
                        users: true
                    }
                },
                createdBy:true
            }
        });
        console.log(reminders)
        responseHandler(200, response, {data: reminders})
    } catch (e) {
        console.log(e)
        responseHandler(500, response, {message: "Error please try again"});
    }
}

export async function getReminderByUser(request: Request, response: Response) {
    try {
        let userId = request.body.user.user_id;
        let reminders = await config._query.reminder.findMany({where: {createdBy: {id: userId}}});
        responseHandler(200, response, {data: reminders})
    } catch (e) {
        responseHandler(500, response, {message: "Error please try again"});
    }
}

export async function getReminderById(request: Request, response: Response) {
    try {
        let userId = request.body.user.user_id;
        let reminderId = request.params.reminderId;
        let reminders = await config._query.reminder.findMany({
            where: {
                createdBy: {id: userId},
                id: parseInt(reminderId)
            }
        });
        responseHandler(200, response, {data: reminders})
    } catch (e) {
        responseHandler(500, response, {message: "Error please try again"});
    }
}


export async function addReminder(request: Request, response: Response) {
    try {
        const userId = request.body.user.id;
        const groupId = request.params.groupId;
        await config._requestParser(['message', 'title', 'self', 'notifyBefore', 'notifyApp', 'notifyWeb', 'when', 'participants', 'recurring'], request.body);
        let {notifyBefore, notifyApp, notifyWeb, message, title, self, when, participants,recurringDays} = request.body;
        when = new Date(when);
        const reminder = await config._query.reminder.create({
            data: {
                notifyBefore: notifyBefore,
                notifyApp: notifyApp,
                notifyWeb: notifyWeb,
                message: message,
                title: title,
                self: self,
                group: {connect: {id: parseInt(groupId)}},
                createdBy: {connect: {id: parseInt(userId)}},
                when: when,
                recurringDays,
            }
        });
        reminder.members = await config._query.reminderMembers.create({
            data: {
                reminderId: reminder.id, users: {
                    connect: participants.map((item: string) => {
                        return {id: parseInt(item)}
                    })

                }
            }, include: {users: true}
        });
        responseHandler(200, response, {data: reminder, message: "Reminder added."})

    } catch (e) {
        console.log(e)
        responseHandler(500, response, {message: "Please try again later", error: e});
    }
}

export async function removeReminder(request: Request, response: Response) {
    try {
        let userId = request.body.user.user_id;
        let reminderId = Number.parseInt(request.params.reminderId);
        let reminder = await config._query.reminder.findFirst({
            where: {
                createdById: parseInt(userId), id: reminderId
            },
            include:{participants:true}
        })
        if (reminder) {
            if(reminder.participants)  await config._query.reminderMembers.delete({where:{reminderId}});
            await config._query.reminder.delete({where: {id: reminder.id}});
            responseHandler(200, response, {message: "Reminder removed"});
        } else {
            responseHandler(403, response, {message: "You can only delete reminder created by you."})
        }
    } catch (e) {
        console.log(e)
        responseHandler(500, response, {message: "Error please try again"});
    }
}

export async function blockReminder(request: Request, response: Response) {
    try {
        const user_id = request.body.user.id;
        const reminderId = parseInt(request.params.reminderId);
        const reminderMember = await config._query.reminderMembers.findFirst({
            where: {reminderId: reminderId},
            include: {users: true}
        });
        console.log(reminderMember)
        if (reminderMember) {
            await config._query.reminderMembers.update({
                where: {
                    id: reminderMember.id
                }, data: {
                    users: {
                        disconnect: {id: user_id}
                    }
                }
            })

            responseHandler(200, response, {message: "Reminder blocked."})
        } else {
            responseHandler(403, response, {message: "Reminder not found"})
        }
    } catch (e) {
        console.log(e);
        responseHandler(500, response, {message: "Please try again later"})
    }
}