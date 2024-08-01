import { NextFunction, Request, Response } from 'express';
import { router } from "../server";
import { validatePassword, validateUsername } from '../utils/validate';
import { IUserMySQL, TUserRole, TUserRoleEnum, TUserStatusEnum } from '../models/User';
import bcrypt from "bcrypt";
import { createToken, refreshToken } from '../middleware/authenticate';
import { config } from "dotenv";
import { HelperController } from '../helpers/Default';
import { authorization } from '../middleware/authorization';
import { v4 } from "uuid";
import { IStoreMySQL } from '../models/Store';
import { connection } from '../utils/database';

config()

const Helpers = new HelperController()

export class ApiUser {

    getMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "user_id, store_id, credit, fullname, role, created_at, status, user_create_id"
                        const [isMe] = await Helpers.select_database_where("users", attr, [["user_id", "=", authorize.user_id!]]) as IUserMySQL[]
                        if (!isMe) return res.status(202).json({ message: "don't have user" })
                        const data: IUserMySQL = {
                            credit: isMe.credit,
                            fullname: isMe.fullname,
                            role: isMe.role,
                            created_at: isMe.created_at,
                            status: isMe.status,
                            user_id: isMe.user_id,
                            constructor: { name: "RowDataPacket" }
                        }
                        if (isMe.user_create_id) Object.assign(data, { user_create_id: isMe.user_create_id })
                        if (isMe.store_id) Object.assign(data, { store_id: isMe.store_id })

                        return res.json(data)
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getCredit = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const [isMe] = await Helpers.select_database_where("users", "credit", [["user_id", "=", authorize.user_id!]]) as IUserMySQL[]
                        if (!isMe) return res.status(202).json({ message: "don't have user" })
                        const data = {
                            credit: isMe.credit
                        }
                        return res.json(data)
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getUsername = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // const data = req.body as { username: string }
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const q = query(usersCollectionRef, where("username", "==", data.username))
                //         const isId = await Helpers.getContain(q)
                //         if (!isId) return res.status(202).json({ message: "don't have user" })
                //         // return res.json(isId)
                //         return res.json(isId)
                //     } else {
                //         return res.sendStatus(authorize)
                //     }
                // }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                const data = req.body as IUserMySQL
                if (authorize) {
                    if (authorize !== 401) {
                        const isId = await Helpers.select_database_where("users", "user_id", [["user_create_id", "=", data.user_create_id!]])
                        if (!isId) return res.status(202).json({ message: "don't have user" })
                        return res.json(isId)
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getUserAllMe = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         let q: Query<DocumentData> | undefined = undefined
                //         if (authorize.role === "ADMIN") {
                //             q = query(usersCollectionRef)
                //         } else if (authorize.role === "AGENT") {
                //             q = query(usersCollectionRef, where("agent_create_id", "==", authorize.id))
                //         } else if (authorize.role === "MANAGER") {
                //             q = query(usersCollectionRef, where("agent_create_id", "==", authorize.agent_create_id), where("manager_create_id", "==", authorize.id))
                //         }

                //         if (!q) return res.sendStatus(403)

                //         const isUserMe = await Helpers.getContain(q)
                //         if (isUserMe.length === 0) return res.status(202).json({ message: "don't have user" })
                //         return res.json(isUserMe)
                //     } else {
                //         return res.sendStatus(authorize)
                //     }
                // }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getUserAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "stores.name AS s_name, user_id, username, credit, fullname, role, `status`, users.user_create_id AS u_create, users.created_at AS create_at, users.store_id AS s_id"
                        const join = [["stores", "stores.store_id", "=", "users.store_id"]]
                        const user = await Helpers.select_database_left_join("users", attr, join) as IUserMySQL[]
                        if (!user) return res.status(202).json({ message: "don't have user" })
                        const res_user: IUserMySQL[] = []
                        user.map((u, i) => {
                            res_user.push({
                                username: u.username,
                                user_id: u.id,
                                credit: u.credit,
                                fullname: u.fullname,
                                role: u.role,
                                status: u.status,
                                create_at: u.create_at,
                                constructor: { name: "RowDataPacket" }
                            })

                            if (u.u_create) res_user[i].u_create = u.u_create
                            if (u.s_id) res_user[i].s_id = u.s_id
                            if (u.s_name) res_user[i].s_name = u.s_name

                        })
                        return res.json(res_user)
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getUserWithStoreId = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const { store } = req.params as { store: string }
                        const attr = "stores.name AS s_name, user_id, username, credit, fullname, role, `status`, users.user_create_id AS u_create, users.created_at AS create_at, users.store_id AS s_id"
                        const join = [["stores", "stores.store_id", "=", "users.store_id"]]
                        const user = await Helpers.select_database_left_join("users", attr, join) as IUserMySQL[]
                        if (!user) return res.status(202).json({ message: "don't have user" })
                        const sql = `
                                        SELECT
                                            stores.name AS s_name,
                                            user_id,
                                            username,
                                            credit,
                                            fullname,
                                            role,
                                            status,
                                            users.user_create_id AS u_create,
                                            users.created_at AS create_at,
                                            users.store_id AS s_id
                                        FROM ??
                                        LEFT JOIN stores ON stores.store_id = users.store_id
                                        WHERE users.store_id = ?
                                        `;

                        connection.query(sql, ["users", store], async (err, result, field) => {
                            if (err) return res.status(202).json(err);
                            return res.json(JSON.parse(JSON.stringify(result)))
                        });
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    getUserAllIsRole = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                const role = req.params.role
                if (authorize) {
                    if (authorize !== 401) {
                        const attr = "user_id, fullname, status, user_create_id, created_at, store_id, role"
                        const where = [["role", "=", role]]
                        const user = await Helpers.select_database_where("users", attr, where) as IUserMySQL[]
                        if (user.length === 0) return res.status(202).json({ message: "don't have user" })
                        const res_user: IUserMySQL[] = []
                        user.map((u) => {
                            res_user.push({
                                user_id: u.user_id,
                                credit: u.credit,
                                fullname: u.fullname,
                                role: u.role,
                                status: u.status,
                                user_create_id: u.user_create_id,
                                created_at: u.created_at,
                                constructor: { name: "RowDataPacket" }
                            })
                            if (u.store_id) Object.assign(res_user, { store_id: u.store_id })
                        })
                        return res.json(res_user)
                    } else {
                        return res.sendStatus(authorize)
                    }
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    credit = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserDoc
                //         const user = await Helpers.getId(doc(db, DBUsers, data.id)) as IUserDoc
                //         if (req.params.excute === "remove" && user.credit - data.credit < 0) return res.sendStatus(403)
                //         let creditMe = 0;
                //         let credit = 0;
                //         if (req.params.excute === "add") {
                //             if (authorize.role === "ADMIN" || authorize.role === "AGENT") {
                //                 credit = user.credit + data.credit
                //             } else if (authorize.role === "MANAGER") {
                //                 if (authorize.credit - data.credit >= 0) {
                //                     creditMe = authorize.credit - data.credit
                //                     credit = user.credit + data.credit
                //                 } else {
                //                     return res.sendStatus(403)
                //                 }
                //             } else {
                //                 return res.sendStatus(403)
                //             }
                //         }
                //         if (req.params.excute === "remove") {
                //             if (authorize.role === "ADMIN" || authorize.role === "AGENT") {
                //                 credit = user.credit - data.credit
                //             } else if (authorize.role === "MANAGER") {
                //                 creditMe = authorize.credit + data.credit
                //                 credit = user.credit - data.credit
                //             }
                //         }
                //         let q: Query<DocumentData> | undefined = undefined

                //         if (authorize.role === "ADMIN") {
                //             q = query(usersCollectionRef, where("1", "==", "1"))
                //         } else if (authorize.role === "AGENT") {
                //             q = query(usersCollectionRef, where("agent_create_id", "==", authorize.id))
                //         } else if (authorize.role === "MANAGER") {
                //             q = query(usersCollectionRef, where("agent_create_id", "==", authorize.agent_create_id), where("manager_create_id", "==", authorize.id))
                //         }

                //         if (!q) return res.sendStatus(202)

                //         const isUserMe = await Helpers.getContain(q)
                //         if (isUserMe.length > 0) {
                //             if (authorize.role === "ADMIN" || authorize.role === "AGENT") {
                //                 await Helpers.update(data.id, DBUsers, { credit } as IUserWithId)
                //                     .then(() => {
                //                         return res.send({ statusCode: res.statusCode, message: "OK" })
                //                     })
                //                     .catch(error => {
                //                         return res.send({ statusCode: res.statusCode, message: error })
                //                     })
                //             } else if (authorize.role === "MANAGER") {
                //                 await Helpers.update(authorize.id, DBUsers, { credit: creditMe } as IUserWithId)
                //                     .then(async () => {
                //                         await Helpers.update(data.id, DBUsers, { credit } as IUserWithId)
                //                             .then(() => {
                //                                 return res.send({ statusCode: res.statusCode, message: "OK" })
                //                             })
                //                             .catch(error => {
                //                                 return res.send({ statusCode: res.statusCode, message: error })
                //                             })
                //                     })
                //                     .catch(error => {
                //                         return res.send({ statusCode: res.statusCode, message: error })
                //                     })


                //             }
                //         }
                //         return res.sendStatus(403)

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

    updateStatus = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.put(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserDoc
                //         await Helpers.update(data.id, DBUsers, { status: data.status } as IUserWithId)
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

    statusAgent = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        this.updateStatus(url, middleware, roles)
    }

    statusManager = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        this.updateStatus(url, middleware, roles)
    }

    statusMember = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        this.updateStatus(url, middleware, roles)
    }

    addUserAdmin = (url: string) => {
        router.post(url, async (req: Request, res: Response) => {
            try {
                const getAdmin = await Helpers.select_database_where("users", "fullname", [["role", "=", TUserRoleEnum.ADMIN]]) as IUserMySQL[]
                if (getAdmin.length > 0) return res.sendStatus(401)

                const data = req.body as { username: string, password: string, fullname: string }
                const isValidateUsername = validateUsername(data.username);
                if (!isValidateUsername) throw new Error("username invalid");

                const isValidatePassword = validatePassword(data.password!);
                if (!isValidatePassword) throw new Error("password invalid");


                const getUsernameContain = await Helpers.select_database_where("users", "fullname", [["username", "=", data.username]]) as IUserMySQL[]

                if (getUsernameContain.length > 0) res.sendStatus(202).send({ message: "this username has been used" })

                const hashedPassword = await bcrypt.hash(data.password!, 10);

                const attribures = ["user_id", "username", "u_password", "fullname", "role", "status"]
                const values = [v4(), data.username, hashedPassword, data.fullname, TUserRoleEnum.ADMIN, TUserStatusEnum.REGULAR]

                await Helpers.insert_database("users", attribures, values)
                    .then(() => {
                        return res.sendStatus(200)
                    })
                    .catch((err) => {
                        return res.send({ statusCode: res.statusCode, message: err })
                    })

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

    addUserAgent = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as IUserMySQL
                        const isValidateUsername = validateUsername(data.username!);
                        if (!isValidateUsername) throw new Error("username invalid");

                        const isValidatePassword = validatePassword(data.u_password!);
                        if (!isValidatePassword) throw new Error("password invalid");

                        const [user] = await Helpers.select_database_where("users", "user_id", [["username", "=", data.username!]]) as IUserMySQL[]

                        if (user) res.sendStatus(202).send({ message: "this username has been used" })

                        const hashedPassword = await bcrypt.hash(data.u_password!, 10);
                        const attr = ["user_id", "username", "u_password", "fullname", "role", "status", "user_create_id"]
                        const values = [v4(), data.username, hashedPassword, data.fullname, TUserRoleEnum.AGENT, TUserStatusEnum.REGULAR, authorize.id]
                        await Helpers.insert_database("users", attr, values)
                            .then(() => {
                                return res.sendStatus(200)
                            })
                            .catch((err) => {
                                return res.send({ statusCode: res.statusCode, message: err })
                            })

                    } else {
                        return res.sendStatus(authorize)
                    }
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

    addUserManager = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserWithId
                //         const isValidateUsername = validateUsername(data.username);
                //         if (!isValidateUsername) return res.sendStatus(202).send({ message: "username invalid" })

                //         const isValidatePassword = validatePassword(data.password!);
                //         if (!isValidatePassword) return res.sendStatus(202).send({ message: "password invalid" })

                //         const q = query(usersCollectionRef, where("username", "==", data.username))
                //         const { docs } = await getDocs(q)

                //         if (docs.length > 0) return res.sendStatus(202).send({ message: "this username has been used" })

                //         const hashedPassword = await bcrypt.hash(data.password!, 10);

                //         if (!data.store_id) return res.status(202).json({ message: "please input store" })
                //         const isStore = await Helpers.getId(doc(db, DBStores, data.store_id)) as IStoreDoc

                //         if (!isStore) return res.status(202).json({ message: "don't have store" })
                //         const user: IUserWithId = {
                //             store_id: data.store_id,
                //             username: data.username,
                //             password: hashedPassword,
                //             fullname: data.fullname,
                //             credit: 0,
                //             role: TUserRoleEnum.MANAGER,
                //             status: TUserStatusEnum.REGULAR,
                //             created_at: GMT(),
                //             updated_at: GMT(),
                //             tokenVersion: 1
                //         }

                //         if (authorize.role === TUserRoleEnum.ADMIN) {
                //             // user.admin_create_id = data.admin_create_id!
                //             user.agent_create_id = data.agent_create_id!
                //         }
                //         if (authorize.role === TUserRoleEnum.AGENT) {
                //             // user.admin_create_id = authorize.admin_create_id
                //             user.agent_create_id = authorize.id
                //         }

                //         await Helpers.create(usersCollectionRef, user)
                //             .then(async () => {
                //                 return res.sendStatus(200)
                //             })
                //             .catch(error => {
                //                 return res.send({ statusCode: res.statusCode, message: error })
                //             })
                //     } else {
                //         return res.sendStatus(authorize)
                //     }
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

    addUserMember = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as IUserMySQL
                        const isValidateUsername = validateUsername(data.username!);
                        if (!isValidateUsername) throw new Error("username invalid");

                        const isValidatePassword = validatePassword(data.u_password!);
                        if (!isValidatePassword) throw new Error("password invalid");
                        const users = await Helpers.select_database_where("users", "user_id", [["username", "=", data.username!]]) as IUserMySQL[]


                        if (users.length > 0) res.sendStatus(202).send({ message: "this username has been used" })

                        const hashedPassword = await bcrypt.hash(data.u_password!, 10);

                        if (!data.store_id) return res.sendStatus(403)
                        const [stores] = await Helpers.select_database_where("stores", "store_id", [["store_id", "=", data.store_id]]) as IStoreMySQL[]
                        //         const isStore = await Helpers.getId(doc(db, DBStores, data.store_id)) as IStoreDoc

                        if (!stores) return res.sendStatus(403)
                        if (authorize.role === TUserRoleEnum.ADMIN) {
                            const attr = ["user_id", "store_id", "username", "u_password", "fullname", "role", "status", "user_create_id"]
                            const values = [v4(), data.store_id!, data.username!, hashedPassword, data.fullname, TUserRoleEnum.MEMBER, TUserStatusEnum.REGULAR, data.user_create_id!]
                            await Helpers.insert_database("users", attr, values)
                                .then(async () => {
                                    return res.sendStatus(200)
                                })
                                .catch(error => {
                                    return res.send({ statusCode: res.statusCode, message: error })
                                })
                        } else if (authorize.role === TUserRoleEnum.AGENT) {

                        }

                        //         const user: IUserWithId | {} = {}
                        //         if (authorize.role === TUserRoleEnum.ADMIN) {
                        //             Object.assign(user, {
                        //                 store_id: data.store_id,
                        //                 username: data.username,
                        //                 password: hashedPassword,
                        //                 fullname: data.fullname,
                        //                 credit: 0,
                        //                 role: TUserRoleEnum.MEMBER,
                        //                 status: TUserStatusEnum.REGULAR,
                        //                 created_at: GMT(),
                        //                 updated_at: GMT(),
                        //                 tokenVersion: 1,
                        //                 admin_create_id: authorize.id,
                        //                 agent_create_id: data.agent_create_id
                        //             } as IUserWithId)
                        //         } else if (authorize.role === TUserRoleEnum.AGENT) {
                        //             Object.assign(user, {
                        //                 store_id: data.store_id,
                        //                 username: data.username,
                        //                 password: hashedPassword,
                        //                 fullname: data.fullname,
                        //                 credit: 0,
                        //                 role: TUserRoleEnum.MEMBER,
                        //                 status: TUserStatusEnum.REGULAR,
                        //                 created_at: GMT(),
                        //                 updated_at: GMT(),
                        //                 tokenVersion: 1,
                        //                 admin_create_id: authorize.admin_create_id,
                        //                 agent_create_id: authorize.id
                        //             } as IUserWithId)

                        //         } else if (authorize.role === TUserRoleEnum.MANAGER) {
                        //             Object.assign(user, {
                        //                 store_id: data.store_id,
                        //                 username: data.username,
                        //                 password: hashedPassword,
                        //                 fullname: data.fullname,
                        //                 credit: 0,
                        //                 role: TUserRoleEnum.MEMBER,
                        //                 status: TUserStatusEnum.REGULAR,
                        //                 created_at: GMT(),
                        //                 updated_at: GMT(),
                        //                 tokenVersion: 1,
                        //                 admin_create_id: authorize.admin_create_id,
                        //                 agent_create_id: authorize.agent_create_id,
                        //                 manager_create_id: authorize.id
                        //             } as IUserWithId)
                        //         }

                        //         await Helpers.create(usersCollectionRef, user as IUserWithId)
                        //             .then(async () => {
                        //                 return res.sendStatus(200)
                        //             })
                        //             .catch(error => {
                        //                 return res.send({ statusCode: res.statusCode, message: error })
                        //             })

                    } else {
                        return res.sendStatus(authorize)
                    }
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

    deleteUserAgent = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserDoc
                //         const q = query(usersCollectionRef, where("admin_create_id", "==", authorize.id), where(documentId(), "==", data.id))
                //         const isUserMe = await Helpers.getContain(q)
                //         if (!isUserMe) return res.status(202).json({ message: "don't have user" })

                //         const closedUser = { status: "CLOSED" } as IUserWithId

                //         await Helpers.update(data.id, DBUsers, closedUser)
                //             .then(async () => {
                //                 return res.sendStatus(200)
                //             })
                //             .catch(() => {
                //                 return res.status(202).json({ message: "delete agent unsuccessfully" })
                //             })

                //     } else {
                //         return res.sendStatus(authorize)
                //     }
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

    deleteUserManager = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserDoc
                //         const q = query(usersCollectionRef, where("agent_create_id", "==", authorize.id), where(documentId(), "==", data.id))
                //         const isUserMe = await Helpers.getContain(q)
                //         if (!isUserMe) return res.sendStatus(403)

                //         const closedUser = { status: "CLOSED" } as IUserWithId

                //         await Helpers.update(data.id, DBUsers, closedUser)
                //             .then(async () => {
                //                 return res.sendStatus(200)
                //             })
                //             .catch(() => {
                //                 return res.status(202).json({ message: "delete manager unsuccessfully" })
                //             })
                //     } else {
                //         return res.sendStatus(authorize)
                //     }
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

    deleteUserMember = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                // const authorize = await authorization(req, roles)
                // if (authorize) {
                //     if (authorize !== 401) {
                //         const data = req.body as IUserDoc
                //         if (authorize.role === "ADMIN") {
                //             const q = query(usersCollectionRef, where(documentId(), "==", data.id))
                //             const isUserMe = await Helpers.getContain(q)
                //             if (!isUserMe) return res.sendStatus(403)
                //         } else if (authorize.role === "AGENT") {
                //             const q = query(usersCollectionRef, where("agent_create_id", "==", authorize.id), where(documentId(), "==", data.id))
                //             const isUserMe = await Helpers.getContain(q)
                //             if (!isUserMe) return res.sendStatus(403)
                //         } else if (authorize.role === "MANAGER") {
                //             const q = query(usersCollectionRef, where("agent_create_id", "==", authorize.agent_create_id), where("manager_create_id", "==", authorize.id), where(documentId(), "==", data.id))
                //             const isUserMe = await Helpers.getContain(q)
                //             if (!isUserMe) return res.sendStatus(403)
                //         }
                //         const closedUser = { status: "CLOSED" } as IUserWithId

                //         await Helpers.update(data.id, DBUsers, closedUser)
                //             .then(async () => {
                //                 return res.sendStatus(200)
                //             })
                //             .catch(() => {
                //                 return res.status(202).json({ message: "delete member unsuccessfully" })
                //             })

                //     } else {
                //         return res.sendStatus(authorize)
                //     }
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


    login = (url: string) => {
        router.post(url, async (req: Request, res: Response) => {
            try {

                const data: { username: string, u_password: string } = req.body
                const tb = "users"
                const attr = "user_id, fullname, role, credit, status, tokenVersion, created_at, updated_at, u_password, user_create_id"
                const where = [["username", "=", data.username]]
                const [user] = await Helpers.select_database_where(tb, attr, where) as IUserMySQL[]
                if (!user) return res.status(202).send({ message: "no account" })

                const isPasswordValid = await bcrypt.compare(
                    data.u_password!,
                    user.u_password!
                )
                if (!isPasswordValid) return res.status(202).send({ message: "invalid password" })

                const access_token = createToken(user.user_id!, user.tokenVersion!, user.role)
                const refresh_token = refreshToken(user.user_id!, user.tokenVersion!, user.role)
                if (!user.tokenVersion) return res.sendStatus(403)
                user.refresh_token = refresh_token
                // const VITE_OPS_COOKIE_NAME = process.env.VITE_OPS_COOKIE_NAME!
                return res
                    .status(200)
                    .send({ access_token, refresh_token })
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    logout = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const data = req.body as IUserMySQL
                        if (data.user_id !== authorize.user_id) return res.sendStatus(401)
                        const tb = "users"
                        const attr = "user_id, fullname, role, credit, status, tokenVersion, created_at, updated_at, u_password, user_create_id"
                        const where = [["user_id", "=", data.user_id!]]
                        const [user] = await Helpers.select_database_where(tb, attr, where) as IUserMySQL[]

                        if (user.length === 0) return res.status(202).send({ message: "no account" })
                        res.json({ message: "logout" })
                        // const { tokenVersion } = { tokenVersion: user.tokenVersion! } as IUserMySQL
                        // await Helpers.update_database_where("users", [["tokenVersion", "=", tokenVersion!.toString()]], [["user_id", "=", user.user_id!]])
                        //     .then(() => {
                        //         res.json({ message: "logout" })
                        //     })
                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (err: any) {
                res.send(err)
            }
        })
    }

    updateUser = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
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
}
