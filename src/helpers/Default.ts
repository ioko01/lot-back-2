import { IBillWithId } from "../models/Bill";
import { IStoreMySQL, IStoreWithId } from "../models/Store";
import { IUser, IUserMySQL, IUserWithId } from "../models/User";
import { hash } from "bcrypt";
import { GMT } from "../utils/time";
import { ILottoWithId } from "../models/Lotto";
import { IRateWithId } from "../models/Rate";
import { IDigitSemiWithId } from "../models/DigitSemi";
import { IDigitCloseWithId } from "../models/DigitClose";
import { ICheckRewardWithId } from "../models/CheckReward";
import { ICommissionWithId } from "../models/Commission";
import { IBillDoc, IBillDocWithId, ICheckRewardDoc, ICheckRewardDocWithId, ICommissionDoc, ICommissionDocWithId, IDigitCloseDoc, IDigitCloseDocWithId, IDigitSemiDoc, IDigitSemiDocWithId, ILottoDoc, ILottoDocWithId, IRateDoc, IRateDocWithId, IStoreDoc, IStoreDocWithId, IUserDoc, IUserDocWithId } from "../models/Id";
import { connection } from "../utils/database";


export class HelperController {

    select_database = (table: string, attribute: string) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ${table}`;
            connection.query(sql, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_left_join = (table: string, attribute: string, joins: string[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? `;
            let fields: string[] = []
            fields.push(table)
            joins.map((j, i) => {
                sql += `LEFT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            connection.query(sql, fields, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_left_join_where = (table: string[], attribute: string, joins: string[][], where: (string | undefined | Date | number)[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM `;
            let fields: (string | undefined | Date | number)[] = []
            let fields2: (string | undefined | Date | number)[] = []

            table.map((t, i) => {
                fields.push(t);
                sql += `?? `;
                if (i < table.length - 1) {
                    sql += `, `
                }
            })
            joins.map((j, i) => {
                sql += `LEFT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_left_join_where_limit = (table: string, attribute: string, joins: string[][], where: (string | undefined | Date | number)[][], limit: number | string) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? `;
            let fields: (string | undefined | Date | number)[] = []
            let fields2: (string | undefined | Date | number)[] = []
            fields.push(table)
            joins.map((j, i) => {
                sql += `LEFT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            sql += ` LIMIT ${limit}`
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_left_join_where_limit_order_by = (table: string, attribute: string, joins: string[][], where: (string | undefined | Date | number)[][], limit: number | string, orderby: string) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? `;
            let fields: (string | undefined | Date | number)[] = []
            let fields2: (string | undefined | Date | number)[] = []
            fields.push(table)
            joins.map((j, i) => {
                sql += `LEFT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            sql += ` ORDER BY ${orderby} LIMIT ${limit}`
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_right_join = (table: string, attribute: string, joins: string[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? `;
            let fields: string[] = []
            fields.push(table)
            joins.map((j, i) => {
                sql += `RIGHT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            connection.query(sql, fields, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_right_join_where = (table: string, attribute: string, joins: string[][], where: (string | undefined | Date | number)[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? `;
            let fields: (string | undefined | Date | number)[] = []
            let fields2: (string | undefined | Date | number)[] = []
            fields.push(table)
            joins.map((j, i) => {
                sql += `RIGHT JOIN ${j[0]} ON ${j[1]} ${j[2]} ${j[3]} `;
            })
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result, field) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    select_database_where = (table: string, attribute: string, where: (string | undefined | Date | number)[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${attribute} FROM ?? WHERE `
            let fields: (string | undefined | Date | number)[] = []
            fields.push(table)
            where.map((w, i) => {
                fields.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            connection.query(sql, fields, (err, result) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    insert_database = (table: string, attributes: string[], values: (string | undefined | Date | number)[]) => {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO ${table} `
            attributes.map((a, i) => {
                if (i == 0) sql += `(`
                sql += `${a}`
                if (i < attributes.length - 1) sql += `, `
                if (i == attributes.length - 1) sql += `)`
            })
            sql += ` VALUES`
            values.map((a, i) => {
                if (i == 0) sql += `(`
                sql += `?`
                if (i < values.length - 1) sql += `, `
                if (i == values.length - 1) sql += `)`
            })
            connection.query(sql, values, (err, result) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    update_database_where = (table: string, attributes: (string | number | Date)[][], where: (string | number | Date)[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE ${table} SET `
            let fields: (string | number | Date)[] = []
            let fields2: (string | number | Date)[] = []
            attributes.map((a, i) => {
                fields.push(a[2])
                sql += `${a[0]} ${a[1]} ? `;
                if (i < attributes.length - 1) {
                    sql += `, `
                }
            })
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    delete_database_where = (table: string, where: string[][]) => {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM ??`
            let fields: (string | number | Date)[] = []
            let fields2: (string | number | Date)[] = []
            sql += ` WHERE `
            where.map((w, i) => {
                fields2.push(w[2])
                sql += `${w[0]} ${w[1]} ?`;
                if (i < where.length - 1) {
                    sql += ` AND `
                }
            })

            fields.push(table)
            const concat_field = fields.concat(fields2)
            connection.query(sql, concat_field, (err, result) => {
                if (err) return reject(err);
                resolve(Object.values(JSON.parse(JSON.stringify(result))));
            });
        });
    }

    // getId = async (doc: DocumentReference) => {
    //     const id = await getDoc(doc)
    //     if (id.exists()) {
    //         return { ...id.data(), id: id.id } as IBillDoc | IStoreDoc | IUserDoc | ILottoDoc | IRateDoc | IDigitSemiDoc | IDigitCloseDoc | ICheckRewardDoc | ICommissionDoc
    //     }
    // }

    // getContain = async (q: Query) => {
    //     const { docs } = await getDocs(q)
    //     return docs.map((doc) => {
    //         return { ...doc.data(), id: doc.id } as IBillDoc | IStoreDoc | IUserDoc | ILottoDoc | IRateDoc | IDigitSemiDoc | IDigitCloseDoc | ICheckRewardDoc | ICommissionDoc
    //     })
    // }


    // getAll = async (reference: CollectionReference) => {
    //     const { docs } = await getDocs(reference)
    //     return docs.map((doc) => {
    //         return { ...doc.data(), id: doc.id } as IBillDoc | IBillDocWithId | IStoreDoc | IStoreDocWithId | IUserDoc | IUserDocWithId | ILottoDoc | ILottoDocWithId | IRateDoc | IRateDocWithId | IDigitSemiDoc | IDigitSemiDocWithId | IDigitCloseDoc | IDigitCloseDocWithId | ICheckRewardDoc | ICheckRewardDocWithId | ICommissionDoc | ICommissionDocWithId
    //     })
    // }

    // getAllWithOrderBy = async (reference: CollectionReference, nameSort: string, sortBy: OrderByDirection = "asc") => {
    //     const { docs } = await getDocs(query(reference, orderBy(nameSort, sortBy)))
    //     return docs.map((doc) => {
    //         return { ...doc.data(), id: doc.id } as IBillDoc | IStoreDoc | IUserDoc | ILottoDoc | IRateDoc | IDigitSemiDoc | IDigitCloseDoc | ICheckRewardDoc | ICommissionDoc
    //     })
    // }

    // add = async (reference: CollectionReference, data: IBillWithId | IStoreWithId | IUserWithId | ILottoWithId | IRateWithId | IDigitSemiWithId | IDigitCloseWithId | ICheckRewardWithId | ICommissionWithId) => {
    //     return await addDoc(reference, data)
    // }

    // update = async (id: string, dbname: string, data: UpdateData<IBillWithId | IStoreWithId | IUserWithId | ILottoWithId | IRateWithId | IDigitSemiWithId | IDigitCloseWithId | ICheckRewardWithId | ICommissionWithId>) => {
    //     const isDoc = doc(db, dbname, id)
    //     return await updateDoc(isDoc, data)
    // }

    // delete = async (id: string, dbname: string) => {
    //     const data = await this.getId(doc(db, dbname, id)) as IBillDoc | IStoreDoc | IUserDoc | ILottoDoc | IRateDoc | IDigitSemiDoc | IDigitCloseDoc | ICheckRewardDoc | ICommissionDoc
    //     if (!data) return 400

    //     const isDoc = doc(db, dbname, id)
    //     return await deleteDoc(isDoc)
    // }

    // create = async (reference: CollectionReference, data: IBillWithId | IStoreWithId | IUserWithId | ILottoWithId | IRateWithId | IDigitSemiWithId | IDigitCloseWithId | ICheckRewardWithId | ICommissionWithId) => {
    //     return await addDoc(reference, data)
    // }

    // createAdmin = async (reference: CollectionReference, q: Query, data: IUser) => {
    //     const { docs } = await getDocs(q)

    //     if (docs.length === 0) {
    //         const { credit, fullname, password, role, status, username } = data

    //         const hashedPassword = await hash(
    //             password!,
    //             10
    //         );

    //         const userObj: IUser = {
    //             username,
    //             password: hashedPassword,
    //             fullname,
    //             role,
    //             status,
    //             credit,
    //             created_at: GMT(),
    //             updated_at: GMT()
    //         }
    //         await addDoc(reference, userObj)
    //             .then(() => {
    //                 return true;
    //             })
    //             .catch(() => {
    //                 return false
    //             })

    //     } else {
    //         return false;
    //     }
    // }
}