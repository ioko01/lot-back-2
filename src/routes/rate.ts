import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { IRate } from '../models/Rate';
import { GMT } from '../utils/time';
import { IRateDoc } from '../models/Id';

const Helpers = new HelperController()

export class ApiRate {
    getRateAllMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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

    getRateMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const q = query(ratesCollectionRef, where("user_create_id", "==", authorize.agent_create_id))
                //         const rate = await Helpers.getContain(q) as IRateDoc[]
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

    getRateAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
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

    addRate = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         let admin_create_id;
                //         if (authorize.role === "AGENT") {
                //             admin_create_id = authorize.admin_create_id
                //         } else if (authorize.role === "ADMIN") {
                //             admin_create_id = authorize
                //         }

                //         const data = req.body as IRate
                //         const lotto = await Helpers.getId(doc(db, DBLottos, data.lotto_id.id))
                //         const store = await Helpers.getId(doc(db, DBStores, data.store_id.id))
                //         if (!lotto) return res.status(202).json({ message: "don't have lotto" })
                //         if (!store) return res.status(202).json({ message: "don't have store" })
                //         const q = query(ratesCollectionRef, where("store_id", "==", data.store_id), where("lotto_id", "==", data.lotto_id))
                //         const checkRate = await Helpers.getContain(q)
                //         if (checkRate.length > 0) return res.status(202).json({ message: "this rate has been used" })
                //         const rate: IRate = {
                //             bet_one_digits: data.bet_one_digits,
                //             bet_two_digits: data.bet_two_digits,
                //             bet_three_digits: data.bet_three_digits,
                //             one_digits: data.one_digits,
                //             two_digits: data.two_digits,
                //             three_digits: data.three_digits,
                //             store_id: data.store_id,
                //             lotto_id: data.lotto_id,
                //             admin_create_id: admin_create_id,
                //             created_at: GMT(),
                //             updated_at: GMT(),
                //             user_create_id: authorize,
                //             committion_id: data.committion_id
                //         }
                //         await Helpers.add(ratesCollectionRef, rate)
                //             .then(() => {
                //                 return res.send({ statusCode: res.statusCode, message: "OK" })
                //             })
                //             .catch(error => {
                //                 return res.send({ statusCode: res.statusCode, message: error })
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
