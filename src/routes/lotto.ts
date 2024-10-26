import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { GMT, getTomorrow } from "../utils/time";
import { HelperController } from "../helpers/Default";
import { ILotto, ILottoMySQL } from "../models/Lotto";
import { ILottoDoc } from '../models/Id';
import { v4 } from 'uuid';
import { IRateMySQL } from '../models/Rate';
import { IStoreMySQL } from '../models/Store';
import { createPool } from 'mysql2';
import { config } from "dotenv";
import { connections } from '../utils/database';
config()

const Helpers = new HelperController()


export class ApiLotto {

    getLottoId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.params as { id: string }
                        // const connection = createPool({
                        //     host: process.env.VITE_OPS_DATABASE_HOST,
                        //     user: process.env.VITE_OPS_DATABASE_USERNAME,
                        //     password: process.env.VITE_OPS_DATABASE_PASSWORD,
                        //     database: process.env.VITE_OPS_DATABASE_NAME,
                        //     port: parseInt(process.env.VITE_OPS_DATABASE_PORT!),
                        // })
                        const sql = `
                        SELECT
                            CONVERT_TZ(NOW(),'+00:00','+07:00') AS now, 
                            lottos.lotto_id AS l_id, 
                            lottos.name AS l_name, 
                            img_flag, 
                            open AS l_open, 
                            close AS l_close, 
                            report, 
                            lottos.status AS l_status , 
                            date_type, 
                            date_open, 
                            thai_open_date, 
                            api, 
                            groups AS l_groups, 
                            lottos.promotion AS promotion, 
                            thai_this_times, 
                            thai_next_times, 
                            lottos.modify_commission As modify_commission, 
                            rates_template.name AS rt_name, 
                            rates_template.one_digits AS rt_one_digits, 
                            rates_template.two_digits AS rt_two_digits, 
                            rates_template.three_digits AS rt_three_digits, 
                            rates_template.bet_one_digits AS rt_bet_one_digits, 
                            rates_template.bet_two_digits AS rt_bet_two_digits, 
                            rates_template.bet_three_digits AS rt_bet_three_digits, 
                            commissions.one_digits AS c_one_digits, 
                            commissions.two_digits AS c_two_digits, 
                            commissions.three_digits AS c_three_digits, 
                            percent, 
                            digits_close.one_digits AS dc_one_digits, 
                            digits_close.two_digits AS dc_two_digits, 
                            digits_close.three_digits AS dc_three_digits,
                            color_background,
                            color_border
                        FROM ??
                            LEFT JOIN lottos ON lottos.lotto_id = rates.lotto_id
                            LEFT JOIN rates_template ON rates_template.rate_template_id = rates.rate_template_id
                            LEFT JOIN commissions ON rates.commission_id = commissions.commission_id
                            LEFT JOIN digits_close ON rates.digit_close_id = digits_close.digit_close_id
                        WHERE rates.lotto_id = ?
                        `;
                        connections.getConnection((err, connection) => {
                            connection.query(sql, ["rates", data.id], async (err, result, field) => {
                                connection.release()
                                if (err) return res.status(202).json(err);
                                const [lotto] = JSON.parse(JSON.stringify(result)) as ILottoMySQL[]


                                return res.json(lotto)
                            });
                            connection.release();
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

    getLottoWithStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
                        // const connection = createPool({
                        //     host: process.env.VITE_OPS_DATABASE_HOST,
                        //     user: process.env.VITE_OPS_DATABASE_USERNAME,
                        //     password: process.env.VITE_OPS_DATABASE_PASSWORD,
                        //     database: process.env.VITE_OPS_DATABASE_NAME,
                        //     port: parseInt(process.env.VITE_OPS_DATABASE_PORT!),
                        // })
                        const sql = `
                                    SELECT 
                                        lottos.lotto_id as l_id, 
                                        lottos.name AS l_name, 
                                        lottos.img_flag AS l_img_flag, 
                                        lottos.open AS l_open, 
                                        lottos.close AS l_close, 
                                        lottos.report AS report, 
                                        lottos.status AS status, 
                                        lottos.promotion As promotion, 
                                        lottos.modify_commission As modify_commission, 
                                        lottos.date_type AS date_type, 
                                        lottos.date_open AS date_open, 
                                        lottos.thai_open_date AS thai_open_date, 
                                        lottos.thai_this_times AS thai_this_times, 
                                        lottos.thai_next_times AS thai_next_times, 
                                        lottos.api AS api, 
                                        lottos.groups AS l_groups, 
                                        stores.name AS s_name, 
                                        CONVERT_TZ(NOW(),'+00:00','+07:00') AS now 
                                    FROM ?? 
                                    LEFT JOIN stores ON stores.store_id = ? 
                                    WHERE lottos.store_id = ?
                                    ORDER BY lottos.report ASC
                                    `;
                        connections.getConnection((err, connection) => {
                            connection.query(sql, ["lottos", store, store], async (err, result, field) => {
                                connection.release()
                                if (err) return res.status(202).json(err);
                                return res.json(JSON.parse(JSON.stringify(result)))
                            });
                            connection.release();
                        })

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

    getLottoAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        // const connection = createPool({
                        //     host: process.env.VITE_OPS_DATABASE_HOST,
                        //     user: process.env.VITE_OPS_DATABASE_USERNAME,
                        //     password: process.env.VITE_OPS_DATABASE_PASSWORD,
                        //     database: process.env.VITE_OPS_DATABASE_NAME,
                        //     port: parseInt(process.env.VITE_OPS_DATABASE_PORT!),
                        // })
                        const sql = "SELECT *, CONVERT_TZ(NOW(),'+00:00','+07:00') AS now FROM lottos ORDER BY `lottos`.`report` ASC";
                        connections.getConnection((err, connection) => {
                            connection.query(sql, (err, result, field) => {
                                connection.release()
                                if (err) return res.status(202).json(err);
                                return res.json(JSON.parse(JSON.stringify(result)))
                            });
                            connection.release();
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

    addLotto = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as ILottoMySQL
                        const lotto: ILottoMySQL = {
                            name: data.name,
                            store_id: data.store_id,
                            img_flag: data.img_flag,
                            l_open: data.l_open,
                            l_close: data.l_close,
                            report: data.report,
                            status: data.status,
                            user_create_id: authorize.user_id,
                            date_type: data.date_type,
                            date_open: data.date,
                            lotto_id: v4(),
                            constructor: { name: "RowDataPacket" },
                        }
                        if (data.date) lotto.date_open = data.date
                        if (data.thai_open_date) lotto.thai_open_date = data.thai_open_date
                        const lotto_id = v4()
                        const attr = ["lotto_id", "store_id", "name", "img_flag", "open AS l_open", "close AS l_close", "report", "status", "date_type", "date_open", "thai_open_date", "api", "groups AS l_groups", "user_create_id"]
                        const values = [lotto_id, data.store_id, data.name, data.img_flag, data.l_open, data.l_close, data.report, data.status.toString(), data.date_type, JSON.stringify(data.date_open!), data.thai_open_date ?? "", data.api ?? "", data.l_groups ?? "", authorize.user_id!]
                        await Helpers.insert_database("lottos", attr, values)
                            .then(async () => {
                                const attr = ["rate_id", "lotto_id", "store_id", "commission_id", "rate_template_id", "user_create_id"]
                                const values = [v4(), lotto_id, data.s_id, data.c_id, data.rate_template_id, authorize.user_id!]
                                await Helpers.insert_database("rates", attr, values)
                                    .then(() => {
                                        return res.send({ statusCode: res.statusCode, message: "OK" })
                                    })
                                    .catch((e) => {
                                        return res.status(202).json({ message: "add rate unsuccessfully : " + e })
                                    })
                            })
                            .catch((e) => {
                                return res.status(202).json({ message: "add lotto unsuccessfully : " + e })
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

    updateLotto = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {

            } catch (error) {
                res.status(res.statusCode).send(error);
            }

        })
    }

    statusLotto = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as ILottoMySQL
                        const where = [["lotto_id", "=", data.id]]

                        await Helpers.update_database_where("lottos", [["status", "=", data.status]], where)
                            .then(() => {
                                res.send({ statusCode: res.statusCode, message: "OK" })
                            })
                            .catch(error => {
                                res.send({ statusCode: res.statusCode, message: error })
                            })
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

    changeStatusPromotionWithStoreIdAndLottoId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const promotion = req.body
                        let user_create_id: string = "";
                        if (authorize.role === "AGENT") {
                            user_create_id = authorize.user_id!.toString()
                        } else if (authorize.role === "ADMIN") {
                            user_create_id = promotion.agent_id
                        }

                        const attr = [["promotion", "=", promotion.status]]
                        const where = [["lotto_id", "=", promotion.lotto_id!], ["store_id", "=", promotion.store_id!]]
                        await Helpers.update_database_where("lottos", attr, where)
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

    changeStatusCommissionWithStoreIdAndLottoId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const promotion = req.body
                        let user_create_id: string = "";
                        if (authorize.role === "AGENT") {
                            user_create_id = authorize.user_id!.toString()
                        } else if (authorize.role === "ADMIN") {
                            user_create_id = promotion.agent_id
                        }

                        const attr = [["modify_commission", "=", promotion.status]]
                        const where = [["lotto_id", "=", promotion.lotto_id!], ["store_id", "=", promotion.store_id!]]
                        await Helpers.update_database_where("lottos", attr, where)
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

    deleteLotto = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.delete(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as { id: string }
                //         await Helpers.delete(data.id, DBLottos)
                //             .then((data) => {
                //                 if (data === 400) return res.status(202).json({ message: "don't have lotto" })
                //                 return res.send({ statusCode: res.statusCode, message: "OK" })
                //             })
                //             .catch(() => {
                //                 return res.status(202).json({ message: "delete lotto unsuccessfully" })
                //             })
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
