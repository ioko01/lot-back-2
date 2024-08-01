import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { ILottoMySQL } from "../models/Lotto";
import { v4 } from 'uuid';
import { connection } from "../utils/database";
import { IPromotionMySQL } from '../models/Promotion';

const Helpers = new HelperController()


export class ApiPromotion {
    getPromotionMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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

    getPromotionWithStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
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
                                        commissions.three_digits AS c_three_digits
                                    FROM ??
                                    LEFT JOIN users ON users.user_id = ??
                                    LEFT JOIN stores ON stores.user_create_id = ?? AND stores.store_id = ?
                                    LEFT JOIN rates_template ON rates_template.rate_template_id = ??
                                    LEFT JOIN commissions ON commissions.commission_id = ??
                                    WHERE promotions.store_id = ?
                                    `
                        const fields = ["promotions", "promotions.user_create_id", "users.user_id", store, "promotions.rate_template_id", "rates_template.commission_id", store]

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

    getPromotionWithStoreIdUsed = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
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
                                        commissions.three_digits AS c_three_digits
                                    FROM ??
                                    LEFT JOIN users ON users.user_id = ??
                                    LEFT JOIN stores ON stores.user_create_id = ?? AND stores.store_id = ?
                                    LEFT JOIN rates_template ON rates_template.rate_template_id = ??
                                    LEFT JOIN commissions ON commissions.commission_id = ??
                                    WHERE promotions.store_id = ? AND promotions.status = ?
                                    `
                        const fields = ["promotions", "promotions.user_create_id", "users.user_id", store, "promotions.rate_template_id", "rates_template.commission_id", store, "USED"]

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

    getPromotionAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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

    addPromotion = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const promotion = req.body as IPromotionMySQL
                        let user_create_id: string = "";
                        if (authorize.role === "AGENT") {
                            user_create_id = authorize.user_id!.toString()
                        } else if (authorize.role === "ADMIN") {
                            user_create_id = promotion.agent_id
                        }

                        const attr = ["promotion_id", "store_id", "rate_template_id", "name", "date_promotion", "user_create_id"]
                        const value = [v4(), promotion.store_id, promotion.rate_template_id, promotion.name, JSON.stringify(promotion.date_promotion!), user_create_id]
                        await Helpers.insert_database("promotions", attr, value)
                            .then(async () => {
                                return res.send({ statusCode: res.statusCode, message: "OK" })
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

    changeStatusPromotionWithStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const promotion = req.body as IPromotionMySQL
                        let user_create_id: string = "";
                        if (authorize.role === "AGENT") {
                            user_create_id = authorize.user_id!.toString()
                        } else if (authorize.role === "ADMIN") {
                            user_create_id = promotion.agent_id
                        }
                        const attr = [["status", "=", "NOT_USED"]]
                        const where = [["store_id", "=", promotion.store_id!]]
                        await Helpers.update_database_where("promotions", attr, where)
                            .then(async () => {
                                const attr = [["status", "=", promotion.status]]
                                const where = [["promotion_id", "=", promotion.promotion_id!], ["user_create_id", "=", user_create_id]]
                                await Helpers.update_database_where("promotions", attr, where)
                                    .then(async () => {
                                        return res.send({ statusCode: res.statusCode, message: "OK" })
                                    })
                                    .catch(error => {
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
}
