import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { ILottoMySQL } from '../models/Lotto';
import { IDigitSemiMySQL } from '../models/DigitSemi';
import { v4 } from 'uuid';

const Helpers = new HelperController()

export class ApiDigitSemi {
    getDigitSemiIdAndStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {

                        let id = req.params.id
                        let st = req.params.start.split("-")
                        let en = req.params.end.split("-")
                        if (parseInt(st[0]) < 10) st[0] = `0${st[0]}`
                        if (parseInt(en[0]) < 10) en[0] = `0${en[0]}`
                        if (parseInt(st[1]) < 10) st[1] = `0${st[1]}`
                        if (parseInt(en[1]) < 10) en[1] = `0${en[1]}`
                        const date_start = new Date(`${st[2]}-${st[1]}-${st[0]} 00:00:00`)
                        const date_end = new Date(`${en[2]}-${en[1]}-${en[0]} 23:59:59`)
                        const attr = "digit_semi_id, times, one_digits, two_digits, three_digits, lotto_id AS l_id, percent"
                        const where = [
                            ["times", ">=", new Date(date_start.toUTCString())],
                            ["times", "<=", new Date(date_end.toUTCString())],
                            ["lotto_id", "=", id],
                            ["store_id", "=", req.params.store],
                        ]
                        const [digitSemi] = await Helpers.select_database_where("digits_semi", attr, where) as IDigitSemiMySQL[]
                        if (!digitSemi) return res.status(202).json({ message: "don't have digits semi" })
                        return res.json(digitSemi)

                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }

            } catch (err: any) {
                // if (err.code === 11000) {
                //     return res.status(409).json({
                //         status: 'fail',
                //         message: 'username already exist',
                //     });
                // }
            }
        })
    }

    getDigitSemiMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {

                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (err: any) {
                // if (err.code === 11000) {
                //     return res.status(409).json({
                //         status: 'fail',
                //         message: 'username already exist',
                //     });
                // }
            }
        })
    }

    getDigitSemiAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {

                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (err: any) {
                // if (err.code === 11000) {
                //     return res.status(409).json({
                //         status: 'fail',
                //         message: 'username already exist',
                //     });
                // }
            }
        })
    }

    addDigitSemi = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body
                        const [lotto] = await Helpers.select_database_where("lottos", "*", [["lotto_id", "=", data.lotto_id]]) as ILottoMySQL[]
                        if (!lotto) return res.status(202).json({ message: "don't have lotto" })

                        if (!data.times) return res.status(202).json({ message: "date is invalid" })

                        const date = new Date(data.times as Date)
                        let day = date.getDate().toString();
                        let month = (date.getMonth() + 1).toString();
                        if (parseInt(month) < 10) month = `0${month}`;
                        if (parseInt(day) < 10) day = `0${day}`;

                        // if (getTomorrow(data.lotto_id.open, `${hour}:${minute}`)) {
                        //     date.setDate(date.getDate() - 1).toString()
                        //     day = date.getDate().toString()
                        // }

                        const times = new Date(`${date.getFullYear()}-${month}-${day} 00:00:00`)
                        const where = [
                            ["lotto_id", "=", data.lotto_id],
                        ]
                        const [digitsSemi] = await Helpers.select_database_where("digits_semi", "lotto_id, digit_semi_id", where) as IDigitSemiMySQL[]

                        if (digitsSemi) {

                            let attr: (string | number | Date)[][] = [[]]
                            attr = [
                                ["lotto_id", "=", data.lotto_id],
                                ["one_digits", "=", JSON.stringify(data.one) ?? "{}"],
                                ["two_digits", "=", JSON.stringify(data.two) ?? "{}"],
                                ["three_digits", "=", JSON.stringify(data.three) ?? "{}"],
                                ["times", "=", times],
                                ["user_create_id", "=", authorize.user_id]
                            ]

                            const where = [
                                ["digit_semi_id", "=", digitsSemi.digit_semi_id]
                            ]
                            await Helpers.update_database_where("digits_semi", attr, where)
                                .then(async () => {
                                    return res.json({ statusCode: res.statusCode, message: "OK" })
                                })
                                .catch(error => {
                                    return res.send({ statusCode: res.statusCode, message: error })
                                })
                        } else {
                            const attr2 = ["digit_semi_id", "store_id", "lotto_id", "one_digits", "two_digits", "three_digits", "times", "user_create_id"]
                            const value2 = [v4(), data.store_id, data.lotto_id, JSON.stringify(data.one), JSON.stringify(data.two), JSON.stringify(data.three), times, authorize.user_id]

                            await Helpers.insert_database("digits_semi", attr2, value2)
                                .then(async () => {
                                    try {
                                        res.json({ statusCode: res.statusCode, message: "OK" })
                                    } catch (error) {
                                        res.json({ statusCode: res.statusCode, message: error })
                                    }
                                })
                                .catch(error => {
                                    return res.send({ statusCode: res.statusCode, message: error })
                                })
                        }
                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (error) {
                res.status(res.statusCode).send(error);
            }
        })
    }

    updateDigitSemi = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {

                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (error) {
                res.status(res.statusCode).send(error);
            }

        })
    }

    deleteDigitSemi = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.delete(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {

                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }

            } catch (error) {
                res.status(res.statusCode).send(error);
            }
        })
    }
}
