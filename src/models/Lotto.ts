import { RowDataPacket } from "mysql2";
import { IInitialState, IInitialStateWithId } from "./Main";

export type TLottoStatus = "OPEN" | "CLOSE"
export type TLottoDate = "SELECT_DATE" | "THAI"

export enum TLottoDateEnum {
    SELECT_DATE = "SELECT_DATE",
    THAI = "THAI",
}

export enum TLottoStatusEnum {
    OPEN = "OPEN",
    CLOSE = "CLOSE",
}

export interface ILotto extends IInitialState {
    name: string //ชื่อหวย
    img_flag: string //สัญลักษณ์หวย(ธง)
    open: string //เวลาเปิดรับ
    close: string //เวลาปิดรับ
    report: string //เวลาผลออก
    status: TLottoStatus //สถานะหวย
    date_type: TLottoDate //ชนิดวันหวยออก
    date?: string[] // วันเปิดรับ
    thai_open_date?: string // วันหวยออกของไทย
    api?: string
    group?: string
}

export interface ILottoWithId extends IInitialStateWithId {
    name: string //ชื่อหวย
    img_flag: string //สัญลักษณ์หวย(ธง)
    open: string //เวลาเปิดรับ
    close: string //เวลาปิดรับ
    report: string //เวลาผลออก
    status: TLottoStatus //สถานะหวย
    date_type: TLottoDate //ชนิดวันหวยออก
    date?: string[] // วันเปิดรับ
    thai_open_date?: string // วันหวยออกของไทย
    api?: string
    group?: string
}

export interface ILottoMySQL extends RowDataPacket {
    lotto_id: string
    store_id: string
    name: string //ชื่อหวย
    img_flag: string //สัญลักษณ์หวย(ธง)
    open: string //เวลาเปิดรับ
    close: string //เวลาปิดรับ
    report: string //เวลาผลออก
    status: TLottoStatus //สถานะหวย
    date_type: TLottoDate //ชนิดวันหวยออก
    date_open?: string[] // วันเปิดรับ
    thai_open_date?: string // วันหวยออกของไทย
    api?: string
    groups?: string
    user_create_id?: string
}