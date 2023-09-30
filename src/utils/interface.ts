import {Request, Response} from "express";

export interface generalProps  {
    req:Request,
    res:Response
}
export interface groupReqInt{
    name:string,
    keywords: string[],
    description:string
}