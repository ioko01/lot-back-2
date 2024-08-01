import { RowDataPacket } from "mysql2";
import { IInitialState, IInitialStateWithId } from "./Main";

export interface IStore extends IInitialState {
    name: string //ชื่อร้าน
    img_logo: string //โลโก้ร้าน
}

export interface IStoreWithId extends IInitialStateWithId {
    name: string //ชื่อร้าน
    img_logo: string //โลโก้ร้าน
}

export interface IStoreMySQL extends RowDataPacket {
    store_id: string
    name: string //ชื่อร้าน
    logo: string //โลโก้ร้าน
    user_create_id?: string
}