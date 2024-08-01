import { RowDataPacket } from "mysql2"
import { IUserDoc } from "./Id"


export interface IInitialState {
    created_at?: Date | FirebaseTimestamp
    updated_at?: Date | FirebaseTimestamp
    admin_create_id?: IUserDoc
    agent_create_id?: IUserDoc
    manager_create_id?: IUserDoc
    user_create_id?: IUserDoc
}

export interface IInitialStateWithId {
    created_at?: Date | FirebaseTimestamp
    updated_at?: Date | FirebaseTimestamp
    admin_create_id?: string
    agent_create_id?: string
    manager_create_id?: string
    user_create_id?: string
}

export interface IInitialStateMySQL extends RowDataPacket {
    created_at?: Date
    updated_at?: Date
    admin_create_id?: string
    agent_create_id?: string
    manager_create_id?: string
    user_create_id?: string
}

export interface FirebaseTimestamp { seconds: number | string, nanoseconds: number | string }

export type TypeDate = {
    startDate: string | Date | null,
    endDate: string | Date | null
} | null

export type TDate = "TODAY" | "YESTERDAY" | "THIS_WEEK" | "LAST_WEEK" | "MONTH" | "SELECT_DATE"