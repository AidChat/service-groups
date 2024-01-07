import {hasher} from "../utils/methods";
import {Socket} from "socket.io";
import {NextFunction, Request, Response} from "express";

export function verifyClient(request:Request,response:Response,next:NextFunction) {
    try {
        let token = request.headers.session;
        if (!token) {
            const err: Error = new Error("Not authorized");
            throw err
        }
        if (token) {
            hasher._verify(token).then((response: any) => {
                request.body.user = {
                    user_id:response.user_id,
                    email: response.data
                }
                next();
            })
                .catch((e:any) => {
                    console.log(e)
                    const err: Error = new Error("Token expired")
                    next(err);
                })
        }
    } catch (e: any) {
        const err: Error = new Error(e.message);
        next(err);
    }
}