
import { RowDataPacket } from "mysql2"
import { IStoreDoc } from "./Id"
import { IInitialState, IInitialStateWithId } from "./Main"

export type TUserRole = "ADMIN" | "AGENT" | "MANAGER" | "MEMBER" | "MANAGE_REWARD"
export type TUserStatus = "REGULAR" | "CLOSED" | "BANNED"

export enum TUserRoleEnum {
    ADMIN = "ADMIN",
    AGENT = "AGENT",
    MANAGER = "MANAGER",
    MEMBER = "MEMBER",
    MANAGE_REWARD = "MANAGE_REWARD"
}

export enum TUserStatusEnum {
    REGULAR = "REGULAR",
    CLOSED = "CLOSED",
    BANNED = "BANNED",
}

export interface IUser extends IInitialState {
    store_id?: IStoreDoc
    username: string
    password?: string
    fullname: string
    role: TUserRole
    status: TUserStatus
    credit: number
    tokenVersion?: number
}

export interface IUserWithId extends IInitialStateWithId {
    store_id?: string
    username: string
    password?: string
    fullname: string
    role: TUserRole
    status: TUserStatus
    credit: number
    tokenVersion?: number
}

export interface IUserMySQL extends RowDataPacket {
    admin_id?: string
    user_id?: string
    store_id?: string
    username?: string
    u_password?: string
    fullname: string
    role: TUserRole
    status: TUserStatus
    credit: number
    user_create_id?: string
    tokenVersion?: number
}