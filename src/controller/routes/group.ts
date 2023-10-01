import {Request, Response} from "express";
import {responseHandler} from "../../utils/response-handler";
import {config} from "../../utils/appConfig";
import {groupReqInt} from "../../utils/interface";
import {hasher} from "../../utils/methods";

/**
 *
 * @param request
 * @param response
 */
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
                    userId: [user.id],
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
                    Socket:true
                }
            }).then((result: any) => {
                responseHandler(200, response, {data: result})
            }).catch((error: any) => {
                console.log(error)
                responseHandler(503, response, {message: "Please try again later"})
            })
        }).catch((reason: any) => {
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
export function getAllGroupsController(request: Request, response: Response) {
    try {
        let user = request.body.user.email;
        config._query.group.findMany({
            where: {
                User: {
                    every: {
                        email: user
                    }
                }
            },
            select: {
                $scalar: false,
                id: true,
                updated_at: true,
                name: true,
                socket: true,
                GroupDetail: true,

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
        let gId = Number(id);
        let user = request.body.user;
        config._query.group.findUnique({
            where: {
                id: gId,
                User: {
                    every: {
                        email: user.email
                    }
                }
            },
            include: {
                GroupDetail: true,
            }

        }).then((result: any) => {
            if (!result) result = [];
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
        let {id, name, description, keywords} = request.body;
        if (!id) {
            return responseHandler(400, response, {message: 'Group not found'});
        }
        if (gid !== id) {
            // suspecious
            return responseHandler(404, response, {message: "Group not found"})
        }
        let updatedData = {
            name, description, keywords
        }
        config._query.group.update({
            where: {
                id: gid
            },
            data: updatedData

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