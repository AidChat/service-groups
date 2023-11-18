import {Request, Response} from "express";
import {responseHandler} from "../../utils/response-handler";
import {config} from "../../utils/appConfig";
import {groupReqInt} from "../../utils/interface";
import {hasher} from "../../utils/methods";
import {Group, MESSAGE_SATUS, RequestType} from "@prisma/client";
import {sendEmail} from "../../utils/mailer";
import {imageUpload, isValidEmail} from "../../utils/common";
import {v4 as uuidv4} from 'uuid';

export function addGroupController(request: Request, response: Response) {
    try {
        let {email} = request.body.user;
        let {requestee} = request.body;
        let group: groupReqInt = request.body;
        let icon: string = request.body.icon;
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
            imageUpload(icon, group.name, function (data) {
                let i = '';
                if (data) {
                    i = data.url;
                }
                config._query.group.create({
                    data: {
                        name: group.name,
                        User: {
                            connect: {
                                id: user.id
                            },
                        },
                        Role: {
                            create: {
                                type: 'OWNER',
                                userId: user.id,
                            }
                        },
                        GroupDetail: {
                            create: {
                                description: group.description,
                                tags: group.keywords,
                                icon: i
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

                    if (isValidEmail({email: requestee})) {

                        const id = uuidv4();
                        sendEmail({link: '', email: requestee}).then((apiResponse) => {
                            config._query.request.create({
                                data: {
                                    id,
                                    groupId: result.id,
                                    userId: user.id,
                                    type: RequestType.INVITE,
                                    invitee: requestee
                                }
                            })
                                .then(() => {
                                    responseHandler(200, response, {data: result})
                                })

                        })
                    } else {
                        responseHandler(200, response, {data: result})
                    }

                }).catch((error: any) => {
                    console.log(error)
                    responseHandler(503, response, {message: "Please try again later"})
                })
            })

        }).catch((reason: any) => {
            console.log(reason);
            responseHandler(403, response, {message: "Try again later"})
        })
    } catch (e: any) {
        console.log(e);
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
                Socket: true,
                Message: {
                    where: {
                        status: MESSAGE_SATUS.DELIVERED
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
                        email: true,
                        profileImage: true
                    }
                },
                Request: {
                    where: {
                        type: "DELETE"
                    },
                    select: {
                        id: true
                    }
                },
                Role: {
                    where: {
                        user: {
                            email: user.email
                        }
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

export function createGroupDeleteRequest(request: Request, response: Response) {
    try {
        let gid: string | number = request.params.id;
        gid = Number(gid);
        const id = uuidv4();
        config._query.user.findFirst({where: {email: request.body.user.email}})
            .then((res: any) => {
                config._query.request.create({
                    data: {
                        id: id,
                        type: "DELETE",
                        invitee: '',
                        group: {
                            connect: {
                                id: gid
                            }
                        },
                        user: {
                            connect:
                            res
                        }
                    }
                }).then(() => {
                    responseHandler(200, response, {message: "Request for delete is created"})
                })
                    .catch((e: any) => {
                        console.log(e)
                        responseHandler(404, response, {message: "Group not found"})
                    })
            })

    } catch (reason) {
        responseHandler(503, response, {message: "Please try again later"})
    }
}


export function updateGroup(request: Request, response: Response) {
    try {
        let gid: Number = Number(request.params.id);
        let {id, name, description, GroupDetail, icon, tags} = request.body;
        if (!id) {
            return responseHandler(400, response, {message: 'Group not found'});
        }
        if (gid !== id) {
            // suspecious
            return responseHandler(404, response, {message: "Group not found"})
        }

        if (icon) {
            imageUpload(icon, name, function (data) {
                let updatedData = {
                    name, GroupDetail: {update: {description: description, icon: data.url, tags: tags}}
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
            })
        } else {
            let updatedData = {
                name, GroupDetail: {update: {description: description, tags: tags}}
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
        }

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
                        name: true,
                        profileImage: true
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
        const email: string = request.body.user.email;
        const requestId: string = request.params.id;
        config._query.user.findFirst({where: {email: email}})
            .then((result: any) => {
                if (result) {
                    if (requestId) {
                        config._query.request.findFirst({where: {id: requestId}})
                            .then((res: any) => {
                                if (res) {
                                    config._query.group.update({
                                        where: {id: res.groupId},
                                        data: {User: {connect: result}},
                                        include: {User: true}
                                    })
                                        .then((groupUpdate: any) => {
                                            config._query.request.delete({where: {id: res.id}})
                                                .then(() => {
                                                    config._query.role.create({
                                                        data: {

                                                            userId: result.id,
                                                            groupId: groupUpdate.id
                                                        }
                                                    })
                                                        .then(() => {
                                                            responseHandler(200, response, {});
                                                        })
                                                })
                                        })
                                        .catch((error: any) => {
                                            console.log(error)
                                            responseHandler(200, response, {});
                                        })
                                } else {
                                    responseHandler(200, response, {data: {}});
                                }
                            })
                            .catch((e: any) => {
                                console.log(e);
                                responseHandler(200, response, {});
                            })
                    }
                }
            })

    } catch (e) {
        console.log(e)
        responseHandler(503, response, {message: "Please try again"});
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
                        Role: {
                            where: {
                                groupId: Number(groupId)
                            }
                        },
                    }
                },

            }
        }).then((data: any) => {
            responseHandler(200, response, {data: data});
        })
            .catch((e: any) => {
                console.log(e)
                responseHandler(503, response, {message: "Please try again later"})
            })

    } catch (e) {
        console.log(e)
        responseHandler(503, response, {message: "Please try again later"})
    }

}

export function createRequest(request: Request, response: Response) {
    try {
        const groupId = Number(request.params.groupId);
        const id = uuidv4();
        const requester = request.body.user.email;
        const requestee = request.body.requestee;
        let link = process.env.CLIENT_LOCAL + id;
        const role = request.body.role;
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
                            responseHandler(200, response, {message: "Request is already sent"})
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

                                sendEmail({link, email: requestee}).then(() => {
                                    config._query.request.create({
                                        data: {
                                            id,
                                            groupId,
                                            userId,
                                            type: RequestType.INVITE,
                                            invitee: requestee,
                                            role: role
                                        }
                                    })
                                        .then((result: any) => {
                                            responseHandler(200, response, {
                                                data: result,
                                                message: result.invitee + " has been requested to join your group"
                                            });
                                        })
                                })
                                    .catch((reason) => {
                                        console.log(reason);
                                        responseHandler(301, response, {message: "Failed to create request"});
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
        config._query.request.findMany({where: {groupId, NOT: {type: 'DELETE'}}})
            .then((result: any) => {
                responseHandler(200, response, {data: result});
            })
            .catch((e: any) => {
                console.log(e)
                responseHandler(200, response, {message: "Please try again"});
            })
    } catch (e) {
        responseHandler(503, response, {message: "Please try again"});

    }
}

export function removeRequest(request: Request, response: Response) {
    try {
        const requestId: string = request.params.id;
        const email = request.body.user.email;
        config._query.user.findUnique({where: {email: email}})
            .then((result: any) => {
                if (result) {
                    config._query.request.findFirst({where: {id: requestId, userId: result.id}})
                        .then((result: any) => {
                            if (result) {
                                config._query.request.delete({where: {id: result.id}}).then((result: any) => {
                                    responseHandler(200, response, {message: "Request removed"});
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

export function getRequest(request: Request, response: Response) {
    try {
        const requestId: string = request.params.id;
        if (!requestId) {
            responseHandler(404, response, {message: "Request not found"});
        } else {
            config._query.request.findFirst({
                where: {id: requestId},
                include: {group: {include: {GroupDetail: true}}, user: {select: {name: true}}}
            })
                .then((result: any) => {
                    responseHandler(200, response, {data: result});
                })
                .catch((error: any) => {
                    console.log(error);
                    responseHandler(503, response, {message: "Something went wront"});
                })
        }
    } catch (e) {
        responseHandler(503, response, {message: "Please try again"})
    }
}