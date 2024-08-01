
import { RowDataPacket } from "mysql2";
import { ICommission } from "./Commission";
import { IDigitPosition } from "./DigitPosition";
import { ILottoDoc, IStoreDoc } from "./Id";
import { IInitialState, IInitialStateWithId } from "./Main";

export interface IRate extends IInitialState {
    store_id: IStoreDoc //ไอดีร้าน
    lotto_id: ILottoDoc //ไอดีหวย
    one_digits: IDigitPosition //ราคาจ่ายเลขวิ่ง ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:3, bottom: 4}
    two_digits: IDigitPosition //ราคาจ่ายเลข 2 ตัว ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:95, bottom:95}
    three_digits: IDigitPosition //ราคาจ่ายเลข 3 ตัว  ราคาจ่ายบน/ราคาจ่ายโต๊ด ==> {top:800, toad:125}
    bet_one_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลขวิ่ง ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_two_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 2 ตัว ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_three_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 3 ตัว ==> {top: 1:100000:100000, bottom: 0:0:0, toad: 1:100000:100000}
    committion_id: ICommission
}

export interface IRateWithId extends IInitialStateWithId {
    store_id: string //ไอดีร้าน
    lotto_id: string //ไอดีหวย
    one_digits: IDigitPosition //ราคาจ่ายเลขวิ่ง ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:3, bottom: 4}
    two_digits: IDigitPosition //ราคาจ่ายเลข 2 ตัว ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:95, bottom:95}
    three_digits: IDigitPosition //ราคาจ่ายเลข 3 ตัว  ราคาจ่ายบน/ราคาจ่ายโต๊ด ==> {top:800, toad:125}
    bet_one_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลขวิ่ง ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_two_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 2 ตัว ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_three_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 3 ตัว ==> {top: 1:100000:100000, bottom: 0:0:0, toad: 1:100000:100000}
    committion_id: string
}

export interface IRateMySQL extends RowDataPacket {
    rate_id?: string
    rate_template_id?: string
    store_id: string //ไอดีร้าน
    lotto_id: string //ไอดีหวย
    name?: string
    one_digits: IDigitPosition //ราคาจ่ายเลขวิ่ง ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:3, bottom: 4}
    two_digits: IDigitPosition //ราคาจ่ายเลข 2 ตัว ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:95, bottom:95}
    three_digits: IDigitPosition //ราคาจ่ายเลข 3 ตัว  ราคาจ่ายบน/ราคาจ่ายโต๊ด ==> {top:800, toad:125}
    bet_one_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลขวิ่ง ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_two_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 2 ตัว ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}
    bet_three_digits: IDigitPosition //อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 3 ตัว ==> {top: 1:100000:100000, bottom: 0:0:0, toad: 1:100000:100000}
    committion_id: string
}