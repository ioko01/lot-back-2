import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { IRate, IRateMySQL } from '../models/Rate';
import { GMT } from '../utils/time';
import { IRateDoc } from '../models/Id';
import { v4 } from 'uuid';
import { ICommission, ICommissionMySQL } from '../models/Commission';
import { connection } from '../utils/database';
import { ApiStore } from './store';
import { authenticate } from '../middleware/authenticate';
import axios from 'axios';
import { IStoreMySQL } from '../models/Store';

const Helpers = new HelperController()

export class ApiRateTemplate {
    getRateTemplateAllMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         let q: Query<DocumentData> | undefined = undefined
                //         if (authorize.role === "ADMIN") {
                //             q = query(ratesCollectionRef)
                //         } else if (authorize.role === "AGENT") {
                //             q = query(ratesCollectionRef, where("user_create_id", "==", authorize.id))
                //         }

                //         if (!q) return res.sendStatus(403)

                //         const rate = await Helpers.getContain(q) as IRateDoc[]
                //         if (rate.length === 0) return res.status(202).json({ message: "don't have rate" })
                //         return res.json(rate)
                //     }
                //     return res.sendStatus(authorize)
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

    getRateTemplateMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "rate_template_id, rates_template.name AS r_name, commission_id AS c_id, stores.name AS s_name, stores.stores_id AS s_id"
                        const join = [["users", "users.user_id", "=", "rates_template.user_create_id"], ["stores", "stores.user_create_id", "=", "users.user_id"]]

                        const rates = await Helpers.select_database_left_join_where(["rates_template"], attr, join, [["user_create_id", "=", authorize.user_id!]])
                        if (!rates) return res.status(202).json({ message: "don't have rate" })
                        return res.json(rates)
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

    getRateTemplateWithStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
                        const sql = `
                                    SELECT
                                        rate_template_id, 
                                        rates_template.name AS r_name, 
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
                                        commissions.three_digits AS c_three_digits
                                    FROM ??
                                        LEFT JOIN users ON users.user_id = ??
                                        LEFT JOIN stores ON stores.user_create_id = ?? AND stores.store_id = rates_template.store_id
                                        LEFT JOIN commissions ON rates_template.commission_id = ??
                                    WHERE
                                        rates_template.store_id = ?
                                    `
                        const fields = ["rates_template", "rates_template.user_create_id", "users.user_id", "commissions.commission_id", store]

                        connection.query(sql, fields, async (err, result, field) => {
                            if (err) return res.status(202).json(err);
                            return res.json(JSON.parse(JSON.stringify(result)))
                        });
                        // const rates = await Helpers.select_database_left_join_where(["rates_template"], attr, join, where)
                        // if (!rates) return res.status(202).json({ message: "don't have rate" })
                        // return res.json(rates)
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

    getRateTemplateAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "rate_template_id, rates_template.name AS r_name, commission_id AS c_id, stores.name AS s_name, stores.store_id AS s_id"
                        const join = [["users", "users.user_id", "=", "rates_template.user_create_id"], ["stores", "stores.user_create_id", "=", "users.user_id"]]
                        const rates = await Helpers.select_database_left_join("rates_template", attr, join)
                        if (!rates) return res.status(202).json({ message: "don't have rate" })
                        return res.json(rates)
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

    getRateId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const q = query(ratesCollectionRef, where("lotto_id.id", "==", req.params.id))
                //         const [rate] = await Helpers.getContain(q) as IRateDoc[]
                //         if (!rate) return res.status(202).json({ message: "don't have rate" })
                //         return res.json(rate)
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

    addRateTemplate = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const rate = req.body as IRateMySQL
                        const commission = req.body.commission as ICommissionMySQL
                        let user_create_id: string = "";
                        if (authorize.role === "AGENT") {
                            user_create_id = authorize.user_id!.toString()
                        } else if (authorize.role === "ADMIN") {
                            user_create_id = rate.agent_id
                        }
                        const commission_id = v4()

                        const attr = ["rate_template_id", "store_id", "commission_id", "name", "one_digits", "two_digits", "three_digits", "bet_one_digits", "bet_two_digits", "bet_three_digits", "user_create_id"]
                        const value = [v4(), rate.store_id, commission_id, rate.name, JSON.stringify(rate.one_digits), JSON.stringify(rate.two_digits), JSON.stringify(rate.three_digits), JSON.stringify(rate.bet_one_digits), JSON.stringify(rate.bet_two_digits), JSON.stringify(rate.bet_three_digits), user_create_id]
                        await Helpers.insert_database("rates_template", attr, value)
                            .then(async () => {
                                const attr = ["commission_id", "one_digits", "two_digits", "three_digits", "user_create_id"]
                                const value = [commission_id, JSON.stringify(commission.one_digits), JSON.stringify(commission.two_digits), JSON.stringify(commission.three_digits), user_create_id]
                                await Helpers.insert_database("commissions", attr, value)
                                    .then(() => {
                                        return res.send({ statusCode: res.statusCode, message: "OK" })
                                    })
                                    .catch((error) => {
                                        return res.send({ statusCode: res.statusCode, message: error })
                                    })
                            })
                            .catch(error => {
                                return res.send({ statusCode: res.statusCode, message: error })
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

    updateRate = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {

                //     } else {
                //         return res.sendStatus(authorize)
                //     }
                // } else {
                //     return res.sendStatus(401)
                // }
            } catch (error) {
                res.status(res.statusCode).send(error);
            }

        })
    }

    deleteRate = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.delete(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {

                //     } else {
                //         return res.sendStatus(authorize)
                //     }
                // } else {
                //     return res.sendStatus(401)
                // }

            } catch (error) {
                res.status(res.statusCode).send(error);
            }
        })
    }
}
