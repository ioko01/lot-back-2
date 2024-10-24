import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { privateKey, publicKey } from "../utils/keys";
import { IUserMySQL, TUserRole } from "../models/User";
import { IToken } from "../models/Token";
import { HelperController } from "../helpers/Default";
import jwt_decode from "jwt-decode";
import { config } from "dotenv";
import { v4 } from "uuid";

config()

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.sendStatus(401)

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, {
            algorithms: ["HS256"],
        }, async (err: any, decoded: string | jwt.JwtPayload | undefined | IToken) => {
            if (err) return res.sendStatus(401)
            const decode = decoded as IToken
            if (decode) next()
        })
    } catch (error) {
        return res.sendStatus(404)
    }
}


export const createToken = (UID: string, tokenVersion: number, role: TUserRole) => {
    const access_token = jwt.sign({ UID, tokenVersion, role }, process.env.ACCESS_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "15m",
    });
    return access_token;
};

export const refreshToken = (UID: string, tokenVersion: number, role: TUserRole) => {
    const r = v4()
    return jwt.sign({ UID, tokenVersion, role, r }, process.env.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1h",
    });
}