import { NextFunction, Request, Response, static as static_ } from "express"
import { router } from "../server"
import { TUserRole } from "../models/User"
import { authorization } from "../middleware/authorization"
import { UploadedFile } from 'express-fileupload'
import path from "path"
import utf8 from "utf8"
import { getPath } from "../utils/path"

export class ApiFile {

    uploadFile = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.post(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        if (req.files) {
                            const file = req.files.File as UploadedFile
                            const filename = file.name
                            if (file.mimetype.match("image/")) {
                                const upload = `${getPath()}${utf8.decode(filename).trim()}`
                                file.mv(upload, (err: any) => {
                                    if (err) return res.send(err)
                                    return res.send("File Uploaded")
                                })
                            } else {
                                return res.send("Memetype not match")
                            }
                        }
                    } else {
                        return res.sendStatus(authorize)
                    }
                } else {
                    return res.sendStatus(401)
                }
            } catch (error) {

            }
        })
    }

    previewFile = (url: string) => {
        router.get(url, async (req: Request, res: Response) => {
            try {
                let options = {
                    root: path.join(getPath())
                };

                return res.sendFile(req.params.file, options, (err: any) => {
                    if (err) {
                        return res.json(err)
                    }
                })
            } catch (error) {

            }
        })
    }


    previewAllFiles = (url: string) => {
        router.use(url, static_(path.join(getPath())))
    }
}