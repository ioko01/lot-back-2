import { IBill, IBillWithId } from "./Bill";
import { ICheckReward, ICheckRewardWithId } from "./CheckReward";
import { ICommission, ICommissionWithId } from "./Commission";
import { IDigitClose, IDigitCloseWithId } from "./DigitClose";
import { IDigitSemi, IDigitSemiWithId } from "./DigitSemi";
import { ILotto, ILottoWithId } from "./Lotto";
import { IRate, IRateWithId } from "./Rate";
import { IStore, IStoreWithId } from "./Store";
import { IUser, IUserWithId } from "./User";

export interface ILottoDoc extends ILotto {
    id: string
}

export interface ILottoDocWithId extends ILottoWithId {
    id: string
}

export interface IRateDoc extends IRate {
    id: string
}

export interface IRateDocWithId extends IRateWithId {
    id: string
}

export interface IBillDoc extends IBill {
    id: string
}

export interface IBillDocWithId extends IBillWithId {
    id: string
}

export interface IDigitCloseDoc extends IDigitClose {
    id: string
}

export interface IDigitCloseDocWithId extends IDigitCloseWithId {
    id: string
}

export interface IStoreDoc extends IStore {
    id: string
}

export interface IStoreDocWithId extends IStoreWithId {
    id: string
}

export interface IUserDoc extends IUser {
    id: string
}

export interface IUserDocWithId extends IUserWithId {
    id: string
}

export interface ICheckRewardDoc extends ICheckReward {
    id: string
}

export interface ICheckRewardDocWithId extends ICheckRewardWithId {
    id: string
}

export interface IDigitSemiDoc extends IDigitSemi {
    id: string;
}

export interface IDigitSemiDocWithId extends IDigitSemiWithId {
    id: string;
}

export interface ICommissionDoc extends ICommission {
    id: string;
}

export interface ICommissionDocWithId extends ICommissionWithId {
    id: string;
}
