
import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { IBill, IBillMySQL, IBillWithId } from "../models/Bill";
import { GMT, getTomorrow } from "../utils/time";
import { HelperController } from "../helpers/Default";
import { IBillDoc, ICommissionDoc, ILottoDoc, ILottoDocWithId, IRateDoc, IRateDocWithId, IStoreDoc, IStoreDocWithId } from '../models/Id';
import { IRateMySQL } from '../models/Rate';
import { ICommissionMySQL } from '../models/Commission';
import { v4 } from 'uuid';
import { ILottoMySQL } from '../models/Lotto';
import moment from 'moment';
import { connection } from '../utils/database';

const Helpers = new HelperController()

export class ApiBill {

    getBillAllMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const { id } = req.params as { id: string }
                //         let q: Query<DocumentData> | undefined = undefined
                //         if (authorize.role === "ADMIN") {
                //             q = query(billsCollectionRef, where(documentId(), "==", id))
                //         } else if (authorize.role === "AGENT") {
                //             q = query(billsCollectionRef, where("agent_create_id", "==", authorize.id))
                //         } else if (authorize.role === "MANAGER") {
                //             q = query(billsCollectionRef, where("agent_create_id", "==", authorize.agent_create_id), where("manager_create_id", "==", authorize.id))
                //         }

                //         if (!q) return res.sendStatus(403)

                //         const bill = await Helpers.getContain(q)
                //         if (bill.length === 0) return res.status(202).json({ message: "don't have bill" })
                //         return res.json(bill)
                //     } else {
                //         return res.sendStatus(authorize)
                //     }
                // } else {
                //     return res.sendStatus(401)
                // }

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

    getBillMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        let st = req.params.start.split("-")
                        let en = req.params.end.split("-")
                        if (parseInt(st[0]) < 10) st[0] = `0${st[0]}`
                        if (parseInt(en[0]) < 10) en[0] = `0${en[0]}`
                        if (parseInt(st[1]) < 10) st[1] = `0${st[1]}`
                        if (parseInt(en[1]) < 10) en[1] = `0${en[1]}`
                        const date_start = moment(new Date(`${st[2]}-${st[1]}-${st[0]} 00:00:00`)).format("YYYY-MM-DD HH:mm:ss")
                        const date_end = moment(new Date(`${en[2]}-${en[1]}-${en[0]} 00:00:00`)).format("YYYY-MM-DD HH:mm:ss")
                        const attr_bill = "rebate, price, win, times, bills.one_digits AS b_one_digits, bills.two_digits AS b_two_digits, bills.three_digits AS b_three_digits, note, `bills`.`status` AS b_status, price, win, bills.bill_id AS b_id, bills.created_at AS b_created_at, "
                        const attr_rate_template = "rates_template.one_digits AS rt_one_digits, rates_template.two_digits AS rt_two_digits, rates_template.three_digits AS rt_three_digits, bet_one_digits, bet_two_digits, bet_three_digits, "
                        const attr_lotto = "lottos.name AS l_name, lottos.lotto_id AS l_id, lottos.promotion AS promotion, "
                        const attr_commission = "commissions.one_digits AS c_one_digits, commissions.two_digits AS c_two_digits, commissions.three_digits AS c_three_digits"
                        const attr = attr_bill + attr_rate_template + attr_lotto + attr_commission
                        const join = [
                            ["rates_template", "bills.rate_id", "=", "rates_template.rate_template_id"],
                            ["lottos", "bills.lotto_id", "=", "lottos.lotto_id"],
                            ["commissions", "rates_template.commission_id", "=", "commissions.commission_id"]
                        ]
                        // console.log(date_times);
                        const where = [
                            ["bills.times", ">=", date_start],
                            ["bills.times", "<=", date_end],
                            ["bills.store_id", "=", authorize.store_id]
                        ]
                        const bills = await Helpers.select_database_left_join_where(["bills"], attr, join, where) as IBillMySQL[]
                        if (!bills) return res.status(202).json({ message: "don't have bill" })
                        return res.json(bills)
                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }

            } catch (err: any) {
                console.log(err);
                // if (err.code === 11000) {
                //     return res.status(409).json({
                //         status: 'fail',
                //         message: 'username already exist',
                //     });
                // }
            }
        })
    }

    getBill15LastMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const [lotto] = await Helpers.select_database_where("lottos", "open, CONVERT_TZ(NOW(),'+00:00','+07:00') AS now", [["lotto_id", "=", req.params.id]]) as ILottoMySQL[]

                        const date = moment(new Date(lotto.now).toUTCString()).utc()

                        let day = date.format("DD")
                        let month = date.format("MM")
                        let hour = date.format("HH")
                        let minute = date.format("mm")

                        if (getTomorrow(lotto.open, `${hour}:${minute}`)) {
                            date.subtract(1, 'days')
                            day = date.format("DD")
                            month = date.format("MM")
                        }
                        const dateTime = new Date(`${req.params.times} 00:00:00`)

                        const attr_bill = "price, rebate, times, bills.one_digits AS b_one_digits, bills.two_digits AS b_two_digits, bills.three_digits AS b_three_digits, note, `bills`.`status` AS b_status, price, win, bills.bill_id AS b_id, bills.created_at AS b_created_at, "
                        const attr_rate_template = "rates_template.one_digits AS rt_one_digits, rates_template.two_digits AS rt_two_digits, rates_template.three_digits AS rt_three_digits, bet_one_digits, bet_two_digits, bet_three_digits, "
                        const attr_lotto = "lottos.name AS l_name, lottos.lotto_id AS l_id, "
                        const attr_commission = "commissions.one_digits AS c_one_digits, commissions.two_digits AS c_two_digits, commissions.three_digits AS c_three_digits"
                        const attr = attr_bill + attr_rate_template + attr_lotto + attr_commission
                        const join = [
                            ["rates_template", "bills.rate_id", "=", "rates_template.rate_template_id"],
                            ["lottos", "bills.lotto_id", "=", "lottos.lotto_id"],
                            ["commissions", "rates_template.commission_id", "=", "commissions.commission_id"]
                        ]
                        const where = [
                            ["bills.times", "=", dateTime],
                            ["bills.lotto_id", "=", req.params.id]
                        ]

                        const bills = await Helpers.select_database_left_join_where_limit_order_by("bills", attr, join, where, 15, "bills.created_at DESC") as IBillMySQL[]
                        if (!bills) return res.status(202).json({ message: "don't have bill" })
                        return res.json(bills)
                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }

            } catch (err: any) {
                console.log(err);
                // if (err.code === 11000) {
                //     return res.status(409).json({
                //         status: 'fail',
                //         message: 'username already exist',
                //     });
                // }
            }
        })
    }

    getBillAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        // const bill = await Helpers.getAll(billsCollectionRef) as IBillDoc[]
                        // if (!bill) return res.status(202).json({ message: "don't have bill" })
                        // return res.json(bill)
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

    calculatePrice = (one_digits: string[], two_digits: string[], three_digits: string[]) => {
        let one_price_array: number[] = []
        let total: number[] = []
        one_digits?.map(digit => {
            const top = digit.split(":")[1]
            const bottom = digit.split(":")[2]
            one_price_array.push(parseInt(top))
            one_price_array.push(parseInt(bottom))
        })
        total.push(one_price_array.reduce((price, current) => price + current, 0))

        let two_price_array: number[] = []
        two_digits?.map(digit => {
            const top = digit.split(":")[1]
            const bottom = digit.split(":")[2]
            two_price_array.push(parseInt(top))
            two_price_array.push(parseInt(bottom))
        })
        total.push(two_price_array.reduce((price, current) => price + current, 0))

        let three_price_array: number[] = []
        three_digits?.map(digit => {
            const top = digit.split(":")[1]
            const bottom = digit.split(":")[2]
            three_price_array.push(parseInt(top))
            three_price_array.push(parseInt(bottom))
        })
        total.push(three_price_array.reduce((price, current) => price + current, 0))

        const price = total.reduce((price, current) => price + current, 0)
        return price
    }

    addBill = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as IBillMySQL
                        if (!data.lotto_id && !data.rate_id && !data.times) return res.sendStatus(403)

                        const sql = `
                            SELECT
                                rates_template.rate_template_id AS rt_id, 
                                promotions.promotion_id AS p_id, 
                                promotions.name AS p_name, 
                                promotions.status AS p_status, 
                                promotions.date_promotion AS p_promotion, 
                                rates_template.commission_id AS c_id, 
                                stores.name AS s_name, 
                                stores.store_id AS s_id,
                                rates_template.one_digits AS rt_one_digits,
                                rates_template.two_digits AS rt_two_digits,
                                rates_template.three_digits AS rt_three_digits,
                                rates_template.bet_one_digits AS rt_bet_one_digits,
                                rates_template.bet_two_digits AS rt_bet_two_digits,
                                rates_template.bet_three_digits AS rt_bet_three_digits,
                                commissions.one_digits AS c_one_digits,
                                commissions.two_digits AS c_two_digits,
                                commissions.three_digits AS c_three_digits,
                                CONVERT_TZ(NOW(),'+00:00','+07:00') AS now
                            FROM ??
                            LEFT JOIN users ON users.user_id = ??
                            LEFT JOIN stores ON stores.user_create_id = ?? AND stores.store_id = ?
                            LEFT JOIN rates_template ON rates_template.rate_template_id = ??
                            LEFT JOIN commissions ON commissions.commission_id = ??
                            WHERE promotions.store_id = ? AND promotions.status = ?
                            `
                        const fields = ["promotions", "promotions.user_create_id", "users.user_id", data.store_id, "promotions.rate_template_id", "rates_template.commission_id", data.store_id, "USED"]

                        connection.query(sql, fields, async (err, result, field) => {
                            if (err) return res.status(202).json(err);
                            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                            const [addbill] = await Helpers.select_database_where("rates", "*, CONVERT_TZ(NOW(),'+00:00','+07:00') AS now", [["lotto_id", "=", data.lotto_id]]) as IRateMySQL[]
                            const attr_comminssion = "one_digits, two_digits, three_digits"
                            const join = [["rates", "rates.commission_id", "=", "commissions.commission_id"]]
                            const where = [["rates.lotto_id", "=", data.lotto_id]]
                            const [commission] = await Helpers.select_database_left_join_where(["commissions"], attr_comminssion, join, where) as ICommissionMySQL[]
                            const [lotto] = await Helpers.select_database_where("lottos", "open, date_type", [["lotto_id", "=", data.lotto_id]]) as ILottoMySQL[]
                            let commissions: number = 0
                            if (addbill.lotto_id == data.lotto_id) {
                                if (result && JSON.parse(JSON.stringify(result))[0]?.p_promotion.includes(days[new Date(data.times.toString()).getUTCDay()])) {
                                    if (JSON.parse(JSON.stringify(result))[0].c_one_digits) {
                                        if (data.one_digits) {
                                            data.one_digits.map((p) => {
                                                if (JSON.parse(JSON.stringify(result))[0].c_one_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_one_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_one_digits as string).bottom!) / 100).toFixed(2))
                                                }
                                            })
                                        }

                                        if (data.two_digits) {
                                            data.two_digits.map((p) => {
                                                if (JSON.parse(JSON.stringify(result))[0].c_two_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_two_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_two_digits as string).bottom!) / 100).toFixed(2))
                                                }
                                            })
                                        }

                                        if (data.three_digits) {
                                            data.three_digits.map((p) => {
                                                if (JSON.parse(JSON.stringify(result))[0].c_three_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_three_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(JSON.parse(JSON.stringify(result))[0].c_three_digits as string).toad!) / 100).toFixed(2))
                                                }
                                            })
                                        }
                                    }
                                } else {
                                    if (commission.one_digits) {
                                        if (data.one_digits) {
                                            data.one_digits.map((p) => {
                                                if (commission.one_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(commission.one_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(commission.one_digits as string).bottom!) / 100).toFixed(2))
                                                }
                                            })
                                        }

                                        if (data.two_digits) {
                                            data.two_digits.map((p) => {
                                                if (commission.two_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(commission.two_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(commission.two_digits as string).bottom!) / 100).toFixed(2))
                                                }
                                            })
                                        }

                                        if (data.three_digits) {
                                            data.three_digits.map((p) => {
                                                if (commission.three_digits) {
                                                    commissions += parseFloat((parseFloat(p.split(":")[1]) * parseFloat(JSON.parse(commission.three_digits as string).top!) / 100).toFixed(2))
                                                    commissions += parseFloat((parseFloat(p.split(":")[2]) * parseFloat(JSON.parse(commission.three_digits as string).toad!) / 100).toFixed(2))
                                                }
                                            })
                                        }
                                    }
                                }


                            } else {
                                return res.status(202).json({ message: "don't have rate in store" })
                            }

                            let date = moment(new Date(addbill.now).toUTCString()).utc()

                            let day = date.format("DD")
                            let month = date.format("MM")
                            let hour = date.format("HH")
                            let minute = date.format("mm")
                            if (lotto.date_type == "THAI") {
                                date = moment(new Date(data.times).toUTCString()).utc()
                                day = date.format("DD")
                                month = date.format("MM")
                            } else {
                                if (getTomorrow(lotto.open, `${hour}:${minute}`)) {
                                    date.subtract(1, 'days')
                                    day = date.format("DD")
                                    month = date.format("MM")
                                }
                            }

                            const dateTime = new Date(`${date.format("YYYY")}-${month}-${day} 00:00:00`)
                            const price = this.calculatePrice(data.one_digits!, data.two_digits!, data.three_digits!)

                            if (authorize.credit < (price - commissions)) return res.status(202).json({ message: "no credit" })

                            const attr = ["bill_id", "store_id", "lotto_id", "rate_id", "times", "one_digits", "two_digits", "three_digits", "note", "status", "price", "rebate", "user_create_id"]
                            const value = [v4(), addbill.store_id!, data.lotto_id, addbill.rate_template_id!, dateTime, JSON.stringify(data.one_digits), JSON.stringify(data.two_digits), JSON.stringify(data.three_digits), data.note, "WAIT", `${price}`, `${commissions.toFixed(2)}`, authorize.user_id!]
                            await Helpers.insert_database("bills", attr, value)
                                .then(async () => {
                                    const attr = [["credit", "=", authorize.credit - (price - commissions)]]
                                    const where = [["user_id", "=", authorize.id]]
                                    await Helpers.update_database_where("users", attr, where)
                                        .then(() => {
                                            res.send({ statusCode: res.statusCode, message: "OK" })
                                        })
                                        .catch(() => {
                                            return res.status(202).json({ message: "update credit unsuccessfully" })
                                        })
                                })
                                .catch(() => {
                                    return res.status(202).json({ message: "add bill unsuccessfully" })
                                })
                        });

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

    // updateBill = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
    //     router.put(url, middleware, async (req: Request, res: Response) => {
    //         try {
    //             const data = req.body
    //             await Helpers.update("1", DBBills, data)
    //                 .then(() => {
    //                     res.send({ statusCode: res.statusCode, message: "OK" })
    //                 })
    //                 .catch(error => {
    //                     res.send({ statusCode: res.statusCode, message: error })
    //                 })
    //         } catch (error) {
    //             res.status(res.statusCode).send(error);
    //         }

    //     })
    // }

    deleteBill = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as { b_id: string }
                        const [isBillMe] = await Helpers.select_database_where("bills", "status, bill_id, one_digits, two_digits, three_digits", [["bill_id", "=", data.b_id]]) as any[]
                        if (!isBillMe) return res.sendStatus(403)

                        if (isBillMe.status === "CANCEL" || isBillMe.status === "REWARD") return res.status(202).json({ message: "can not delete bill" })
                        const price = this.calculatePrice(JSON.parse(isBillMe.one_digits)!, JSON.parse(isBillMe.two_digits)!, JSON.parse(isBillMe.three_digits)!)

                        if (!price) return res.status(202).json({ message: "can not delete bill" })

                        await Helpers.update_database_where("bills", [["status", "=", "CANCEL"]], [["bill_id", "=", isBillMe.bill_id]])
                            .then(async () => {
                                await Helpers.update_database_where("users", [["credit", "=", authorize.credit + price]], [["user_id", "=", authorize.user_id!]])
                                    .then(() => {
                                        res.send({ statusCode: res.statusCode, message: "OK" })
                                    })
                                    .catch(() => {
                                        return res.status(202).json({ message: "update credit unsuccessfully" })
                                    })
                            })
                            .catch(error => {
                                return res.status(202).json({ message: "delete bill unsuccessfully" })
                            })
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
