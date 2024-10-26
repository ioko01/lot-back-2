import { TUserRole } from "./User"

export interface IToken {
    UID: string
    u_role: TUserRole
    tokenVersion: number
    iat: number
    exp: number
}