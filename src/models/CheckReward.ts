
import { RowDataPacket } from "mysql2";
import { ILottoDoc } from "./Id";
import { FirebaseTimestamp, IInitialState, IInitialStateWithId } from "./Main";
import { TBillStatus } from "./Bill";

export interface ICheckReward extends IInitialState {
    lotto_id: ILottoDoc //ไอดีหวย
    times: Date | FirebaseTimestamp //งวดที่ออก
    top: string //ผลที่ออก 153
    bottom: string //ผลที่ออก 68
}

export interface ICheckRewardWithId extends IInitialStateWithId {
    lotto_id: string //ไอดีหวย
    times: Date | FirebaseTimestamp //งวดที่ออก
    top: string //ผลที่ออก 153
    bottom: string //ผลที่ออก 68
}

export interface ICheckRewardMySQL extends RowDataPacket {
    lotto_id: string //ไอดีหวย
    times: Date //งวดที่ออก
    top: string //ผลที่ออก 153
    bottom: string //ผลที่ออก 68
}