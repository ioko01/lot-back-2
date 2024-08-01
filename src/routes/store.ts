import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { IUserMySQL, TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { GMT } from '../utils/time';
import { IStore, IStoreMySQL, IStoreWithId } from '../models/Store';
import { IStoreDoc, IStoreDocWithId, IUserDoc } from '../models/Id';
import { v4 } from 'uuid';

const Helpers = new HelperController()

export class ApiStore {
    constructor() {

    }

    getStoreWithId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { id } = req.params as { id: string }
                        const attr = "logo, store_id, name, user_create_id"
                        const where = [["stores.store_id", "=", id]]
                        const s = await Helpers.select_database_where("stores", attr, where) as IStoreMySQL

                        if (!s) return res.status(202).json({ message: "don't have store" })

                        return res.json(s)
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

    getStoreAllMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const { id } = req.params as { id: string }
                //         const q = query(storesCollectionRef, where("user_create_id", "==", authorize.id), where(documentId(), "==", id))

                //         const store = await Helpers.getContain(q)
                //         if (store.length === 0) return res.status(202).json({ message: "don't have store" })
                //         return res.json(store)
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

    getStoreMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         let q: Query<DocumentData> | undefined = undefined
                //         if (authorize.role === "ADMIN") {
                //             q = query(storesCollectionRef)
                //         } else if (authorize.role === "AGENT") {
                //             q = query(storesCollectionRef, where("user_create_id", "==", authorize.id))
                //         } else if (authorize.role === "MANAGER" || authorize.role === "MANAGE_REWARD" || authorize.role === "MEMBER") {
                //             q = query(storesCollectionRef, where(documentId(), "==", authorize.store_id))
                //         }

                //         if (!q) return res.sendStatus(403)

                //         const store = await Helpers.getContain(q) as IStoreDoc[]
                //         if (!store) return res.status(202).json({ message: "don't have store" })
                //         return res.json(store)
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

    getStoreAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "stores.store_id AS s_id, name, logo, stores.user_create_id AS u_id, fullname"
                        const join = [["stores", "users.user_id", "=", "stores.user_create_id"]]
                        const users = await Helpers.select_database_right_join("users", attr, join) as IUserMySQL[]

                        if (users.length === 0) return res.status(202).json({ message: "don't have store" })

                        let storeAndOwner: any
                        const getStore = users.map(async (user) => {
                            storeAndOwner = {
                                store_id: user.s_id,
                                logo: user.logo,
                                name: user.name,
                                user_create_id: user.u_id,
                                fullname: user.fullname,
                                constructor: { name: "RowDataPacket" }
                            }
                            return storeAndOwner
                        })

                        return res.json(await Promise.all(getStore))
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

    addStore = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                let authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as IStoreMySQL
                        const attr = "store_id, name, logo, user_create_id"
                        const where = [["name", "=", data.name]]
                        const stores = await Helpers.select_database_where("stores", attr, where) as IStoreMySQL[]
                        if (stores.length > 0) return res.status(202).json({ message: "this store has been used" })
                        //         // if (data.agent_create_id) authorize = data.agent_create_id

                        // const store: IStoreMySQL = {
                        //     logo: data.img_logo,
                        //     name: data.name,
                        //     user_create_id: data.user_create_id!,
                        //     store_id: v4(),
                        //     constructor: { name: "RowDataPacket" }
                        // }

                        const attr2 = ["logo", "name", "user_create_id", "store_id"]
                        const value = ["logo.png", data.name, data.user_create_id!, v4()]
                        await Helpers.insert_database("stores", attr2, value)
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
            } catch (error) {
                res.status(res.statusCode).send(error);
            }
        })
    }

    updateStore = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body
                //         await Helpers.update("1", DBStores, data)
                //             .then(() => {
                //                 res.send({ statusCode: res.statusCode, message: "OK" })
                //             })
                //             .catch(error => {
                //                 res.send({ statusCode: res.statusCode, message: error })
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

    deleteStore = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.delete(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as { id: string }
                //         await Helpers.delete(data.id, DBStores)
                //             .then((data) => {
                //                 if (data === 400) return res.status(202).json({ message: "don't have store" })
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
}
