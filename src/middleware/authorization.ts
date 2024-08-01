import { Request } from "express";
import jwt_decode from "jwt-decode";
import { IToken } from "../models/Token";
import { IUserMySQL, TUserRole } from "../models/User";
import { HelperController } from "../helpers/Default";
import { IUserDoc, IUserDocWithId } from "../models/Id";

export async function authorization(req: Request, roles: TUserRole[]) {
    try {
        // const VITE_OPS_COOKIE_NAME = process.env.VITE_OPS_COOKIE_NAME!
        // const auth = req.cookies[VITE_OPS_COOKIE_NAME]
        const token = req.headers.authorization?.split(' ')[1]
        if (token) {
            // const token = auth
            const decodedToken = jwt_decode<IToken>(token)
            const Helpers = new HelperController()
            const tb = "users"
            const attr = "user_id, store_id, user_create_id,  fullname, role, credit, status, tokenVersion, created_at, updated_at, u_password"
            const where = [["user_id", "=", decodedToken.UID]]
            const [user] = await Helpers.select_database_where(tb, attr, where) as IUserMySQL[]

            if (decodedToken.tokenVersion === user.tokenVersion) {
                const isUser: IUserMySQL = {
                    credit: user.credit,
                    fullname: user.fullname,
                    id: decodedToken.UID,
                    role: user.role,
                    status: user.status,
                    user_id: user.user_id,
                    constructor: { name: "RowDataPacket" },
                }
                if (user.store_id) Object.assign(isUser, { store_id: user.store_id } as IUserDocWithId)
                if (user.user_create_id) Object.assign(isUser, { admin_create_id: user.admin_create_id } as IUserDocWithId)
                if (roles.includes(decodedToken.role)) return isUser
                return 401
            }
            return 401
        }
        return 401
    } catch (error) {
        return 401
    }
}