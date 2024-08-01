import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { IBillDoc, ICheckRewardDoc, ILottoDoc } from '../models/Id';
import { ICheckReward, ICheckRewardMySQL } from '../models/CheckReward';
import { GMT, getTomorrow } from '../utils/time';
import { ILottoMySQL } from '../models/Lotto';
import { v4 } from 'uuid';
import { IBillMySQL, TBillStatus } from '../models/Bill';
import moment from 'moment';
import { connection } from '../utils/database';
import { IDigitSemiMySQL } from '../models/DigitSemi';

const Helpers = new HelperController()

interface Reward {
    id: string;
    total_win: number;
    status: TBillStatus;
}

export class ApiCheckReward {
    getCheckRewardAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const reward = await Helpers.getAll(checkRewardsCollectionRef) as ICheckRewardDoc[]
                //         if (!reward) return res.status(202).json({ message: "don't have reward" })
                //         return res.json(reward)
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

    getCheckRewardAllWithDateStartEnd = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
                        let st = req.params.start.split("-")
                        let en = req.params.end.split("-")
                        let store_id = authorize.store_id
                        if (parseInt(st[0]) < 10) st[0] = `0${st[0]}`
                        if (parseInt(en[0]) < 10) en[0] = `0${en[0]}`
                        if (parseInt(st[1]) < 10) st[1] = `0${st[1]}`
                        if (parseInt(en[1]) < 10) en[1] = `0${en[1]}`
                        const date_start = new Date(`${st[2]}-${st[1]}-${st[0]} 00:00:00`)
                        const date_end = new Date(`${en[2]}-${en[1]}-${en[0]} 23:59:59`)
                        const attr_check_reward = "check_reward_id, times, top, bottom, "
                        const attr_lotto = "lottos.lotto_id AS l_id, lottos.name AS l_name, open, close, report, api"
                        const attr = attr_check_reward + attr_lotto
                        if (authorize.role == "ADMIN") store_id = store
                        const sql = `SELECT ${attr} FROM ?? LEFT JOIN lottos ON lottos.lotto_id = check_rewards.lotto_id AND lottos.store_id = ? WHERE times >= ? AND times <= ?`
                        const fields = ["check_rewards", store_id, new Date(date_start.toUTCString()), new Date(date_end.toUTCString())]
                        connection.query(sql, fields, (err, result, field) => {
                            if (err) return res.status(202).json(err);
                            return res.json(JSON.parse(JSON.stringify(result)))
                        });
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

    getCheckReward5Last = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const [lotto] = await Helpers.select_database_where("lottos", "open, CONVERT_TZ(NOW(),'+00:00','+07:00') AS now", [["lotto_id", "=", req.params.id]]) as ILottoMySQL[]

                        const date = moment(new Date(lotto.now).toUTCString()).utc()

                        let dayEnd = date.format("DD")
                        let monthEnd = date.format("MM")
                        let hour = date.format("HH")
                        let minute = date.format("mm")
                        if (getTomorrow(lotto.open, `${hour}:${minute}`)) {
                            date.subtract(1, 'days')
                            dayEnd = date.format("DD")
                            monthEnd = date.format("MM")
                        }
                        date.subtract(5, 'days')
                        let dayStart = date.format("DD")
                        let monthStart = date.format("MM")

                        const dateStart = new Date(`${date.format("YYYY")}-${monthStart}-${dayStart} 00:00:00`)
                        const dateEnd = new Date(`${date.format("YYYY")}-${monthEnd}-${dayEnd} 00:00:00`)

                        const attr_check_rewards = "times, top, bottom, "
                        const attr_lotto = "lottos.name AS l_name, lottos.lotto_id AS l_id"
                        const attr = attr_check_rewards + attr_lotto
                        const join = [["lottos", "check_rewards.lotto_id", "=", "lottos.lotto_id"]]
                        const where = [
                            ["check_rewards.times", ">=", dateStart],
                            ["check_rewards.times", "<=", dateEnd],
                            ["check_rewards.lotto_id", "=", req.params.id]
                        ]

                        const check_rewards = await Helpers.select_database_left_join_where_limit_order_by("check_rewards", attr, join, where, 5, "check_rewards.times DESC") as ICheckRewardMySQL[]
                        if (!check_rewards) return res.status(202).json({ message: "don't have check_rewards" })
                        return res.json(check_rewards)
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

    getCheckRewardId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.params as { id: string }
                //         const checkReward = await Helpers.getId(doc(db, DBCheckRewards, data.id))
                //         if (!checkReward) return res.status(202).json({ message: "don't have reward id" })
                //         return res.json(checkReward)
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

    getCheckRewardMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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

    getCheckRewardStore = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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


    calculateReward = (one_digits: string[], two_digits: string[], three_digits: string[], reward_top: string, reward_bottom_or_toad: string, rt_one_digits: string, rt_two_digits: string, rt_three_digits: string, digits_semi?: IDigitSemiMySQL) => {
        let bill_reward: Reward = {
            id: "",
            status: "REWARD",
            total_win: 0
        }
        one_digits?.map(digit => {
            const ONE = digit.split(":")
            if (reward_top?.match(ONE[0])) {
                let p = 0
                if (digits_semi) {
                    if (JSON.parse(digits_semi.one_digits as string).top.includes(ONE[0])) p = parseInt(JSON.parse(rt_one_digits).top!) / 2 ?? 0
                } else {
                    p = parseInt(JSON.parse(rt_one_digits).top!) ?? 0
                }
                bill_reward.total_win += parseInt(ONE[1]) * p
            }
            if (reward_bottom_or_toad?.match(ONE[0])) {
                let p = 0
                if (digits_semi) {
                    if (JSON.parse(digits_semi.one_digits as string).bottom.includes(ONE[0])) p = parseInt(JSON.parse(rt_one_digits).bottom!) / 2 ?? 0
                } else {
                    p = parseInt(JSON.parse(rt_one_digits).bottom!) ?? 0
                }
                bill_reward.total_win += parseInt(ONE[2]) * p
            }
        })

        two_digits?.map(digit => {
            const TWO = digit.split(":")
            if (reward_top?.substring(1).match(TWO[0])) {
                let p = 0
                if (digits_semi) {
                    if (JSON.parse(digits_semi.two_digits as string).top.includes(TWO[0])) p = parseInt(JSON.parse(rt_two_digits).top!) / 2 ?? 0
                } else {
                    p = parseInt(JSON.parse(rt_two_digits).top!) ?? 0
                }
                bill_reward.total_win += parseInt(TWO[1]) * p
            }
            if (reward_bottom_or_toad?.match(TWO[0])) {
                let p = 0
                if (digits_semi) {
                    if (JSON.parse(digits_semi.two_digits as string).bottom.includes(TWO[0])) p = parseInt(JSON.parse(rt_two_digits).bottom!) / 2 ?? 0
                } else {
                    p = parseInt(JSON.parse(rt_two_digits).bottom!) ?? 0
                }
                bill_reward.total_win += parseInt(TWO[2]) * p
            }
        })


        three_digits?.map(digit => {
            const THREE = digit.split(":")
            if (reward_top?.match(THREE[0])) {
                if (THREE[1] != "0") {
                    let p = 0
                    if (digits_semi) {
                        if (JSON.parse(digits_semi.three_digits as string).top.includes(THREE[0])) p = parseInt(JSON.parse(rt_three_digits).top!) / 2 ?? 0
                    } else {
                        p = parseInt(JSON.parse(rt_three_digits).top!) ?? 0
                    }
                    bill_reward.total_win += parseInt(THREE[1]) * p
                }
                if (THREE[2] != "0") {
                    let p = 0
                    if (digits_semi) {
                        if (JSON.parse(digits_semi.three_digits as string).toad.includes(THREE[0])) p = parseInt(JSON.parse(rt_three_digits).toad!) / 2 ?? 0
                    } else {
                        p = parseInt(JSON.parse(rt_three_digits).toad!) ?? 0
                    }
                    bill_reward.total_win += parseInt(THREE[2]) * p
                }
            } else {
                const tmpFilter: string[] = []
                const tmp: string[] = []
                const split = reward_top?.split("")
                split?.map((_, index) => {
                    const arrTemp: number[] = []
                    for (let i = 0; i < 3; i++) (i !== index) && arrTemp.push(i)
                    tmp.push(split[index].concat(split[arrTemp[0]], split[arrTemp[1]]))
                    tmp.push(split[index].concat(split[arrTemp[1]], split[arrTemp[0]]))
                })
                const filter = Array.from(new Set(tmp))
                filter.map((digit, index) => index > 0 && tmpFilter.push(digit))
                if (tmpFilter.includes(THREE[0])) {
                    const p = parseInt(JSON.parse(rt_three_digits).toad!) ?? 0
                    bill_reward.total_win += parseInt(THREE[2]) * p
                }
            }
        })

        return bill_reward
    }

    addCheckReward = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body
                        const [lotto] = await Helpers.select_database_where("lottos", "*", [["lotto_id", "=", data.l_id]]) as ILottoMySQL[]
                        if (!lotto) return res.status(202).json({ message: "don't have lotto" })

                        if (!data.times) return res.status(202).json({ message: "date is invalid" })

                        const date = new Date(data.times as Date)
                        let day = date.getDate().toString();
                        let month = (date.getMonth() + 1).toString();
                        if (parseInt(month) < 10) month = `0${month}`;
                        if (parseInt(day) < 10) day = `0${day}`;

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
                        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

                        if (data.top.length != 3) return res.status(202).json({ message: "invalid top digits" })
                        if (data.bottom.length != 2) return res.status(202).json({ message: "invalid bottom digits" })
                        const date_start = new Date(`${date.getFullYear()}-${month}-${day} 00:00:00`)
                        const date_end = new Date(`${date.getFullYear()}-${month}-${day} 23:59:59`)
                        const where = [
                            ["lotto_id", "=", data.l_id],
                            ["times", ">=", date_start],
                            ["times", "<=", date_end]
                        ]
                        const [checkLotto] = await Helpers.select_database_where("check_rewards", "lotto_id, check_reward_id", where) as ICheckRewardMySQL[]

                        const attr_semi = "digit_semi_id, times, one_digits, two_digits, three_digits, lotto_id AS l_id, percent"
                        const [digitSemi] = await Helpers.select_database_where("digits_semi", attr_semi, [["times", ">=", date_start], ["times", "<=", date_end], ["lotto_id", "=", data.l_id]]) as IDigitSemiMySQL[]

                        if (checkLotto) {
                            const attr = [
                                ["lotto_id", "=", data.l_id],
                                ["top", "=", data.top],
                                ["bottom", "=", data.bottom],
                                ["times", "=", date_start],
                                ["user_create_id", "=", authorize.user_id]
                            ]
                            const where = [
                                ["check_reward_id", "=", checkLotto.check_reward_id]
                            ]
                            await Helpers.update_database_where("check_rewards", attr, where)
                                .then(async () => {
                                    connection.query(sql, fields, async (err, result, field) => {

                                        let rt_one_digits = 0
                                        let rt_two_digits = 0
                                        let rt_three_digits = 0
                                        let promotion = false

                                        if (err) return res.status(202).json(err);
                                        if (result && JSON.parse(JSON.stringify(result))[0]?.p_promotion.includes(days[new Date(data.times).getUTCDay()]) && lotto.promotion == "USED") {
                                            promotion = true
                                            rt_one_digits = JSON.parse(JSON.stringify(result))[0]?.rt_one_digits
                                            rt_two_digits = JSON.parse(JSON.stringify(result))[0]?.rt_two_digits
                                            rt_three_digits = JSON.parse(JSON.stringify(result))[0]?.rt_three_digits
                                        }

                                        const attr_bill2 = "bills.bill_id AS b_id, bills.rate_id AS b_rate_id, times, bills.one_digits AS b_one_digits, bills.two_digits AS b_two_digits, bills.three_digits AS b_three_digits, "
                                        const attr_rates_template2 = "rates_template.one_digits AS rt_one_digits, rates_template.two_digits AS rt_two_digits, rates_template.three_digits AS rt_three_digits, bet_one_digits, bet_two_digits, bet_three_digits"
                                        const attr2 = attr_bill2 + attr_rates_template2

                                        const join2 = [
                                            ["rates_template", "rates_template.rate_template_id", "=", "rates.rate_template_id"]
                                        ];

                                        const where2 = [
                                            ["bills.lotto_id", "=", data.l_id],
                                            ["times", ">=", date_start],
                                            ["times", "<=", date_end],
                                            ["status", "=", "REWARD"],
                                            ["rates.lotto_id", "=", data.l_id]
                                        ]

                                        const bills = await Helpers.select_database_left_join_where(["bills", "rates"], attr2, join2, where2) as IBillMySQL[]
                                        bills.map(async (bill) => {
                                            if (!promotion) {
                                                rt_one_digits = bill.rt_one_digits
                                                rt_two_digits = bill.rt_two_digits
                                                rt_three_digits = bill.rt_three_digits
                                            }
                                            const price = this.calculateReward(JSON.parse(bill.b_one_digits!), JSON.parse(bill.b_two_digits!), JSON.parse(bill.b_three_digits!), data.top, data.bottom, rt_one_digits.toString(), rt_two_digits.toString(), rt_three_digits.toString(), digitSemi)
                                            const attr = [["win", "=", price.total_win]]
                                            const where = [
                                                ["status", "!=", "CANCEL"],
                                                ["bill_id", "=", bill.b_id]
                                            ]
                                            await Helpers.update_database_where("bills", attr, where)
                                        })

                                    });

                                    const attr = [["status", "=", "REWARD"]]
                                    const where = [
                                        ["lotto_id", "=", data.l_id],
                                        ["times", ">=", date_start],
                                        ["times", "<=", date_end],
                                        ["status", "=", "WAIT"]
                                    ]
                                    await Helpers.update_database_where("bills", attr, where)
                                    try {
                                        res.json({ statusCode: res.statusCode, message: "OK" })
                                    } catch (error) {
                                        res.json({ statusCode: res.statusCode, message: error })
                                    }
                                })
                                .catch(error => {
                                    return res.send({ statusCode: res.statusCode, message: error })
                                })
                        } else {
                            const attr2 = ["check_reward_id", "lotto_id", "top", "bottom", "times", "user_create_id"]
                            const value2 = [v4(), data.l_id, data.top, data.bottom, date_start, authorize.user_id]
                            await Helpers.insert_database("check_rewards", attr2, value2)
                                .then(async () => {
                                    connection.query(sql, fields, async (err, result, field) => {
                                        let rt_one_digits = 0
                                        let rt_two_digits = 0
                                        let rt_three_digits = 0
                                        let promotion = false

                                        if (err) return res.status(202).json(err);
                                        if (result && JSON.parse(JSON.stringify(result))[0]?.p_promotion.includes(days[new Date(data.times).getUTCDay()]) && lotto.promotion == "USED") {
                                            promotion = true
                                            rt_one_digits = JSON.parse(JSON.stringify(result))[0]?.rt_one_digits
                                            rt_two_digits = JSON.parse(JSON.stringify(result))[0]?.rt_two_digits
                                            rt_three_digits = JSON.parse(JSON.stringify(result))[0]?.rt_three_digits
                                        }

                                        const attr_bill3 = "bills.bill_id AS b_id, bills.rate_id AS b_rate_id, times, bills.one_digits AS b_one_digits, bills.two_digits AS b_two_digits, bills.three_digits AS b_three_digits, "
                                        const attr_rates_template3 = "rates_template.one_digits AS rt_one_digits, rates_template.two_digits AS rt_two_digits, rates_template.three_digits AS rt_three_digits, bet_one_digits, bet_two_digits, bet_three_digits"
                                        const attr3 = attr_bill3 + attr_rates_template3

                                        const join3 = [
                                            ["rates_template", "rates_template.rate_template_id", "=", "rates.rate_template_id"]
                                        ];

                                        const where3 = [
                                            ["bills.lotto_id", "=", data.l_id],
                                            ["times", ">=", date_start],
                                            ["times", "<=", date_end],
                                            ["status", "!=", "CANCEL"],
                                            ["rates.lotto_id", "=", data.l_id]
                                        ]

                                        const bills = await Helpers.select_database_left_join_where(["bills", "rates"], attr3, join3, where3) as IBillMySQL[]
                                        bills.map(async (bill) => {
                                            if (!promotion) {
                                                rt_one_digits = bill.rt_one_digits
                                                rt_two_digits = bill.rt_two_digits
                                                rt_three_digits = bill.rt_three_digits
                                            }
                                            
                                            const price = this.calculateReward(JSON.parse(bill.b_one_digits!), JSON.parse(bill.b_two_digits!), JSON.parse(bill.b_three_digits!), data.top, data.bottom, rt_one_digits.toString(), rt_two_digits.toString(), rt_three_digits.toString(), digitSemi)
                                            const attr = [["win", "=", price.total_win]]
                                            const where = [
                                                ["status", "!=", "CANCEL"],
                                                ["bill_id", "=", bill.b_id]
                                            ]
                                            await Helpers.update_database_where("bills", attr, where)
                                        })

                                    });



                                    const attr = [["status", "=", "REWARD"]]
                                    const where = [
                                        ["lotto_id", "=", data.l_id],
                                        ["times", ">=", date_start],
                                        ["times", "<=", date_end],
                                        ["status", "=", "WAIT"]
                                    ]

                                    await Helpers.update_database_where("bills", attr, where)
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

    updateCheckReward = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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

    deleteCheckReward = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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
