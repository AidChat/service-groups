import {Request, Response} from "express";
import {responseHandler} from "../../utils/response-handler";
import {config} from "../../utils/appConfig";
import {groupReqInt} from "../../utils/interface";
import {hasher} from "../../utils/methods";
import {randomUUID} from "crypto";
import * as crypto from "crypto";
import {Group, RequestType, User} from "@prisma/client";
import {statusCodes} from "../../utils/types";


export function addGroupController(request: Request, response: Response) {
    try {
        let {email} = request.body.user;
        let group: groupReqInt = request.body;
        if (!group?.name || !group?.description || !group?.keywords) {
            return responseHandler(400, response, {message: 'Please add required fields'})
        }
        config._query.user.findUnique({
            where: {
                email: email
            }
        }).then((result: any) => {
            let user = result;
            let socketId = hasher._generateId();
            config._query.group.create({
                data: {
                    name: group.name,
                    User: {
                        connect: {
                            id: user.id
                        }
                    },
                    GroupDetail: {
                        create: {
                            description: group.description,
                            tags: group.keywords
                        }
                    },
                    Socket: {
                        create: {
                            socket_id: socketId
                        }
                    }
                },
                include: {
                    GroupDetail: true,
                    Socket: true
                }
            }).then((result: any) => {
                responseHandler(200, response, {data: result})
            }).catch((error: any) => {
                console.log(error)
                responseHandler(503, response, {message: "Please try again later"})
            })
        }).catch((reason: any) => {
            console.log(reason);
            responseHandler(403, response, {message: "Try again later"})
        })
    } catch (e: any) {
        responseHandler(503, response, {message: e.message})
    }
}

/**
 *
 * @param request
 * @param response
 */
export function getAllGroups(request: Request, response: Response) {
    try {
        let user = request.body.user.email;
        config._query.group.findMany({
            where: {
                User: {
                    some: {
                        email: user
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            },
            include: {
                GroupDetail: true,
                User: true,
                Socket: true
            },

        }).then((result: any) => {
            responseHandler(200, response, {data: result})
        })
            .catch((reason: any) => {
                console.log(reason)
                responseHandler(503, response, {message: 'Please try again later'});
            })
    } catch (reason: any) {
        console.log(reason);
        responseHandler(503, response, {message: "Please try again after sometime"})
    }
}

/**
 *
 * @param request
 * @param response
 */
export function getGroup(request: Request, response: Response) {
    try {
        let id: string = request.params.id;
        let gId: number = Number(id);
        let user = request.body.user;
        config._query.group.findUnique({
            where: {
                id: gId,
                User: {
                    some: {
                        email: user.email
                    }
                }
            },
            include: {
                GroupDetail: true,
                Socket: true,
                User: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }

        }).then((result: any) => {
            responseHandler(200, response, {data: result})
        })
            .catch((reason: any) => {
                console.log(reason)
                responseHandler(503, response, {message: 'Please try again later'});
            })
    } catch (reason: any) {
        console.log(reason);
        responseHandler(503, response, {message: "Please try again after sometime"})
    }
}

export function deleteGroup(request: Request, response: Response) {
    try {
        let gid: string | number = request.params.id;
        gid = Number(gid)
        config._query.group.deleteMany({
            where: {
                id: gid
            }
        }).then((result: any) => {
            responseHandler(200, response, {message: "Removed"})
        }).catch((reason: any) => {
            console.log(reason);
            responseHandler(503, response, {message: "Please try again"})
        })
    } catch (reason) {
        responseHandler(503, response, {message: "Please try again later"})
    }
}

export function updateGroup(request: Request, response: Response) {
    try {
        let gid: Number = Number(request.params.id);
        let {id, name, description, GroupDetail} = request.body;
        if (!id) {
            return responseHandler(400, response, {message: 'Group not found'});
        }
        if (gid !== id) {
            // suspecious
            return responseHandler(404, response, {message: "Group not found"})
        }
        let updatedData = {
            name, description
        }
        config._query.group.update({
            where: {
                id: gid
            },
            data: updatedData,
            include: {
                GroupDetail: true
            }
        }).then((result: any) => {
            responseHandler(200, response, {data: result});
        }).catch((reason: any) => {
            console.log(reason);
            responseHandler(404, response, {message: 'Group not found'});
        })
    } catch (e) {
        responseHandler(503, response, {message: "Please try again"})
    }
}

export function messages(request: Request, response: Response) {
    try {
        let {email} = request.body.user;
        let group: string | number = request.params.groupId;
        group = Number(group);
        config._query.message.findMany({
            where: {
                Group: {
                    is: {
                        id: group,
                        User: {
                            some: {
                                email
                            }
                        }
                    }
                }
            },
            include: {
                MessageContent: true,
                User: {
                    select: {
                        name: true
                    }
                }
            }
        }).then((result: any) => {
            responseHandler(200, response, {data: result});
        }).catch((error: any) => {
            console.log(error);
            responseHandler(503, response, {message: "Please try again later"})
        })
    } catch (e) {
        console.log(e);
        responseHandler(503, response, {message: "Please try again later"})
    }
}

export function addUserToGroup(request: Request, response: Response) {
    try {
        const groupId: string = request.params.id;
        const user_id: string = request.body.User.id;
    } catch (e) {

    }
}


export function GroupMembers(request: Request, response: Response) {
    try {
        let groupId: string = request.params.id;

        config._query.group.findUnique({
            where: {
                id: Number(groupId)
            },
            include: {
                User: {
                    select: {
                        id: true,
                        email: true,
                        password: false,
                        name: true,
                        role: true
                    }
                }
            }
        }).then((data: any) => {
            responseHandler(200, response, {data: data});
        })
            .catch((e: any) => {
                responseHandler(503, response, {message: "Please try again later"})
            })

    } catch (e) {
        responseHandler(503, response, {message: "Please try again later"})
    }

}

export function createRequest(request: Request, response: Response) {
    try {
        const groupId = Number(request.params.groupId);
        const id = new Date().getMilliseconds();
        const requester = request.body.user.email;
        const requestee = request.body.requestee;
        config._query.user.findFirst({where: {email: requester, Group: {some: {id: groupId}}}, include: {Group: true}})
            .then((result: any) => {
                if (!result) {
                    return responseHandler(403, response, {message: "Suspecious!!!"});
                }
                config._query.request.findFirst({
                    where: {
                        invitee: requestee,
                        groupId: groupId
                    }
                })
                    .then((req: any) => {
                        if (req) {
                            return responseHandler(200, response, {message: "Request is already sent"})
                        } else {
                            const groups = result.Group;
                            let allowed = false;
                            groups.forEach((group: Group) => {
                                if (group.id === groupId) {
                                    allowed = true
                                }
                            })
                            if (allowed) {
                                const userId = result.id;
                                config._query.request.create({
                                    data: {
                                        id,
                                        groupId,
                                        userId,
                                        type: RequestType.INVITE,
                                        invitee: requestee
                                    }
                                })
                                    .then((result: Request) => {
                                        responseHandler(200, response, {data: result});
                                    })
                            } else {
                                responseHandler(403, response, {message: "Suspecious!!!"})
                            }
                        }
                    })


            })
            .catch((error: any) => {
                console.log(error)
                responseHandler(404, response, {message: "Not found"});
            })


    } catch (e) {
        console.log(e)
        responseHandler(503, response, {message: 'Please try again'})
    }

}

export function getAllRequests(request: Request, response: Response) {

    try {
        let groupId = Number(request.params.groupId);
        config._query.request.findMany({where: {groupId}})
            .then((result: any) => {
                responseHandler(200, response, {data: result});
            })
            .catch(() => {
                responseHandler(200, response, {message: "Please try again"});
            })
    } catch (e) {
        responseHandler(503, response, {message: "Please try again"});

    }
}

export function removeRequest(request: Request, response: Response) {
    try {
        const requestId: number = Number(request.params.inviteId);
        const email = request.body.user.email;
        config._query.user.findUnique({where: {email: email}})
            .then((result: any) => {
                if (result) {
                    config._query.request.findFirst({where: {id: requestId, userId: result.id}})
                        .then((result: any) => {
                            if (result) {
                                config._query.request.delete({where: {id: result.id}}).then((result:any)=>{
                                    responseHandler(200,response,{message:"Request deleted"});
                                })
                            } else {
                                responseHandler(200, response, {message: "Request not found"})
                            }
                        })
                }
            })
    } catch
        (e) {
        responseHandler(503, response, {message: "Please try again"})
    }

}