
import { RowDataPacket } from "mysql2";
import { ILottoDoc, IRateDoc, IStoreDoc } from "./Id";
import { FirebaseTimestamp, IInitialState, IInitialStateWithId } from "./Main";

export type TBillStatus = "WAIT" | "CANCEL" | "REWARD"

export interface IBill extends IInitialState {
    store_id: IStoreDoc //ไอดีร้าน
    lotto_id: ILottoDoc //ไอดีหวย
    rate_id: IRateDoc //ไอดีเรทการจ่าย
    times: Date | FirebaseTimestamp //งวดที่ออก
    one_digits?: string[] //เลขวิ่ง ตัวเลข/ราคาบน/ราคาล่าง ==> [1:5000:5000, 3:5000:0]
    two_digits?: string[] //เลข 2 ตัว ตัวเลข/ราคาบน/ราคาล่าง [01:5:5, 10:5:5, 02:10:5, 20:10:5]
    three_digits?: string[] //เลข 3 ตัว ตัวเลข/ราคาบน/ราคาจ่ายโต๊ด [011:5:5, 101:5:5, 025:5:5, 205:5:5]
    reward?: string[] //ถูกรางวัล
    note: string //หมายเหตุ
    status?: TBillStatus //สถานะ
}

export interface IBillWithId extends IInitialStateWithId {
    store_id: string //ไอดีร้าน
    lotto_id: string //ไอดีหวย
    rate_id: string //ไอดีเรทการจ่าย
    times: Date | FirebaseTimestamp //งวดที่ออก
    one_digits?: string[] //เลขวิ่ง ตัวเลข/ราคาบน/ราคาล่าง ==> [1:5000:5000, 3:5000:0]
    two_digits?: string[] //เลข 2 ตัว ตัวเลข/ราคาบน/ราคาล่าง [01:5:5, 10:5:5, 02:10:5, 20:10:5]
    three_digits?: string[] //เลข 3 ตัว ตัวเลข/ราคาบน/ราคาจ่ายโต๊ด [011:5:5, 101:5:5, 025:5:5, 205:5:5]
    reward?: string[] //ถูกรางวัล
    note: string //หมายเหตุ
    status?: TBillStatus //สถานะ
}

export interface IBillMySQL extends RowDataPacket {
    store_id: string //ไอดีร้าน
    lotto_id: string //ไอดีหวย
    rate_id: string //ไอดีเรทการจ่าย
    times: Date //งวดที่ออก
    one_digits?: string[] //เลขวิ่ง ตัวเลข/ราคาบน/ราคาล่าง ==> [1:5000:5000, 3:5000:0]
    two_digits?: string[] //เลข 2 ตัว ตัวเลข/ราคาบน/ราคาล่าง [01:5:5, 10:5:5, 02:10:5, 20:10:5]
    three_digits?: string[] //เลข 3 ตัว ตัวเลข/ราคาบน/ราคาจ่ายโต๊ด [011:5:5, 101:5:5, 025:5:5, 205:5:5]
    reward?: string[] //ถูกรางวัล
    note: string //หมายเหตุ
    status?: TBillStatus //สถานะ
}