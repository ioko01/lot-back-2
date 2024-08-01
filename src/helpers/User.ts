import bcrypt from "bcrypt";
import { IUser } from "../models/User";
import { TUserRoleEnum } from "../models/User";
import { GMT } from "../utils/time";
import { IUserDoc } from "../models/Id";

export class UserController {

    // getContain = async (q: Query) => {
    //     const { docs } = await getDocs(q)
    //     return docs.map((doc) => {
    //         return { ...doc.data(), id: doc.id } as IUserDoc
    //     })
    // }


    // getAll = async () => {
    //     const { docs } = await getDocs(usersCollectionRef)
    //     return docs.map((doc) => {
    //         return { ...doc.data(), id: doc.id } as IUserDoc
    //     })
    // }

    // create = async (user: IUser) => {
    //     return await addDoc(usersCollectionRef, user)
    // }

    // createAdmin = async (user: IUser) => {
    //     const q = query(usersCollectionRef, where("role", "==", TUserRoleEnum.ADMIN))
    //     const { docs } = await getDocs(q)

    //     if (docs.length === 0) {
    //         const { credit, fullname, password, role, status, username } = user

    //         const hashedPassword = await bcrypt.hash(
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
    //         await addDoc(usersCollectionRef, userObj)
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

    // addAdmin = async (user: IUser) => {

    // }

    // update = async (id: string, user: IUser) => {
    //     const tutorialDoc = doc(db, DBUsers, id)
    //     return await updateDoc(tutorialDoc, DBUsers, user)
    // }
}