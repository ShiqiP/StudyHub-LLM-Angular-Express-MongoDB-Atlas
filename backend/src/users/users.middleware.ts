import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { ErrorWithStatus, Token } from "../common/utils";

export const checkToken: RequestHandler<unknown, unknown, unknown, unknown> = async (req, res, next) => {
    try {
        const authentication_header = req.headers['authorization'];
        if (!authentication_header) throw new ErrorWithStatus('No Token Found', 401);

        const token = (authentication_header as string).split(" ")[1];
        if (!process.env.SECRET) throw new ErrorWithStatus('Secret not found', 401);

        const decoded = verify(token, process.env.SECRET) as Token;
        req['user'] = decoded;
        next();

    } catch (e) {
        next(e);
    }
};