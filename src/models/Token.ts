import { TUserRole } from "./User"

export interface IToken {
    UID: string
    role: TUserRole
    tokenVersion: number
    iat: number
    exp: number
}