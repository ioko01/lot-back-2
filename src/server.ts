import express, { Application, NextFunction, Request, Response } from 'express'
import bodyParser from "body-parser";
import cors from "cors";
import { config } from 'dotenv'
import { ApiBill } from './routes/bill';
import { ApiUser } from './routes/user';
import { ApiStore } from './routes/store';
// import { PORT, corsOption, socketServerOption } from './config/default';
import { PORT, corsOption } from './config/default';
import cookieParser from 'cookie-parser';
import { authenticate, createToken, refreshToken } from './middleware/authenticate';
import { ApiLotto } from './routes/lotto';
import { ApiRate } from './routes/rate';
import { ApiDigitSemi } from './routes/digitSemi';
import { ApiDigitClose } from './routes/digitClose';
import { ApiCheckReward } from './routes/checkReward';
import http from "http";
// import { Server as SocketIOServer, Socket } from "socket.io";
// import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './utils/socket-io';
// import { digitCloseHandler } from './socket/digitCloseHandler';
// import { userHandler } from './socket/userHandler';
// import { storeHandler } from './socket/storeHandler';
import upload from 'express-fileupload'
import { ApiFile } from './routes/file';
// import { creditHandler } from './socket/creditHandler';
import { ApiRateTemplate } from './routes/rate_template';
import { ApiPromotion } from './routes/promotion';
import jwt from 'jsonwebtoken';
import { IToken } from './models/Token';

config()

export const APP: Application = express()
export const router = express.Router()

const server = http.createServer(APP)
// export const io = new SocketIOServer(server, { cors: { origin: true } })

// APP.set("trust proxy", 1)
APP.use(cookieParser())
APP.use(cors(corsOption))
APP.use(bodyParser.json())
APP.use(upload())

const Bill = new ApiBill()
const User = new ApiUser()
const Store = new ApiStore()
const Lotto = new ApiLotto()
const Rate = new ApiRate()
const RateTemplate = new ApiRateTemplate()
const DigitSemi = new ApiDigitSemi()
const DigitClose = new ApiDigitClose()
const CheckReward = new ApiCheckReward()
const File = new ApiFile()
const Promotion = new ApiPromotion()
// const API = new ApiGetCheckReward()


// io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {

//     digitCloseHandler(socket)
//     userHandler(socket)
//     storeHandler(socket)
//     creditHandler(socket)

//     socket.on("disconnect", () => {
//         // console.log("user is disconnected");
//     })
// })

// API.apiGetResultAll('/result/api', authenticate, ["ADMIN", "AGENT", "MANAGER", "MANAGE_REWARD", "MEMBER"])


// :id = ไอดีที่ต้องการ :store = ไอดีร้าน
Bill.getBillAllMe('/get/bill/id/:id', authenticate, ["ADMIN", "AGENT", "MANAGER"])// ดูบิลทั้งหมดของร้านตัวเอง
Bill.getBillAll('/get/bill/all', authenticate, ["ADMIN"])// ดูบิลทั้งหมด

// :start = วันที่เริ่มต้น :end = วันที่สิ้นสุด
Bill.getBillMe('/get/bill/me/:start/:end', authenticate, ["MEMBER"])// ดูบิลของฉัน
Bill.getBill15LastMe('/get/bill/last/:id/:times', authenticate, ["MEMBER"])
Bill.addBill('/add/bill', authenticate, ["MEMBER"]) // เพิ่มบิล
// Bill.updateBill('/update/bill', authenticate, ["MANAGER"])
Bill.deleteBill('/delete/bill', authenticate, ["MANAGER", "MEMBER"])

// Lotto.getLottoId('/get/lotto/id/:id', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
// Lotto.getLottoMe('/get/lotto/me', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
// Lotto.getLottoAll('/get/lotto/all', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
Lotto.getLottoWithStoreId('/lottos/:store', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
Lotto.getLottoId('/get/lotto/id/:id', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
Lotto.addLotto('/add/lotto', authenticate, ["ADMIN"])
Lotto.updateLotto('/update/lotto', authenticate, ["ADMIN"])
Lotto.statusLotto('/status/lotto', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
Lotto.deleteLotto('/delete/lotto', authenticate, ["ADMIN"])
Lotto.changeStatusPromotionWithStoreIdAndLottoId('/lotto/promotion/status', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน
Lotto.changeStatusCommissionWithStoreIdAndLottoId('/lotto/commission/status', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน

Store.getStoreWithId('/store/:id', authenticate, ["ADMIN", "AGENT"])// agent ดูร้านในเครือข่ายของตัวเอง
Store.getStoreAllMe('/get/store/me/:id', authenticate, ["ADMIN", "AGENT"])// agent ดูร้านในเครือข่ายของตัวเอง
Store.getStoreMe('/get/store/me', authenticate, ["ADMIN", "AGENT", "MANAGER", "MANAGE_REWARD", "MEMBER"])// ดูร้านของตัวเอง
Store.getStoreAll('/get/store', authenticate, ["ADMIN"])//ดูร้านทุกร้าน
Store.addStore('/add/store', authenticate, ["ADMIN", "AGENT"])//เพิ่มร้าน
Store.updateStore('/update/store', authenticate, ["ADMIN", "AGENT"])//อัพเดตร้าน
Store.deleteStore('/delete/store', authenticate, ["ADMIN", "AGENT"])//ลบร้าน (ทำเป็นสถานะลบออกเฉยๆ)

Rate.getRateAllMe('/get/rate/me/all', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาในเครือข่ายของตัวเอง
Rate.getRateMe('/get/rate/me', authenticate, ["MANAGER", "MEMBER"])// ดูเรทราคาของร้านตัวเอง

Rate.getRateAll('/get/rate', authenticate, ["ADMIN"])// ดูเรทราคาทุกร้าน
Rate.getRateId('/get/rate/id/:id', authenticate, ["ADMIN", "AGENT", "MANAGER", "MANAGE_REWARD", "MEMBER"])// ดูเรทราคาทุกร้าน
Rate.addRate('/add/rate', authenticate, ["ADMIN", "AGENT"])// เพิ่มเรทราคา
Rate.updateRate('/add/rate', authenticate, ["ADMIN", "AGENT"])
Rate.deleteRate('/add/rate', authenticate, ["ADMIN", "AGENT"])


Promotion.getPromotionWithStoreId('/promotions/:store/', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน
Promotion.getPromotionWithStoreIdUsed('/promotions/:store/used', authenticate, ["ADMIN", "AGENT", "MANAGER", "MANAGE_REWARD", "MEMBER"])// ดูเรทราคาทุกร้าน
Promotion.changeStatusPromotionWithStoreId('/promotions/status', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน
Promotion.addPromotion('/add/promotion', authenticate, ["ADMIN", "AGENT"])// เพิ่มเรทราคา


RateTemplate.getRateTemplateAllMe('/get/rate_template/me/all', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาในเครือข่ายของตัวเอง
// RateTemplate.getRateTemplateMe('/rates_template/me', authenticate, ["MANAGER", "MEMBER"])// ดูเรทราคาของร้านตัวเอง

RateTemplate.getRateTemplateWithStoreId('/rates_template/:store', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน
RateTemplate.getRateTemplateAll('/get/rate_template', authenticate, ["ADMIN", "AGENT"])// ดูเรทราคาทุกร้าน
RateTemplate.getRateId('/get/rate_template/id/:id', authenticate, ["ADMIN", "AGENT", "MANAGER", "MANAGE_REWARD", "MEMBER"])// ดูเรทราคาทุกร้าน
RateTemplate.addRateTemplate('/add/rate_template', authenticate, ["ADMIN", "AGENT"])// เพิ่มเรทราคา
RateTemplate.updateRate('/update/rate_template', authenticate, ["ADMIN", "AGENT"])
RateTemplate.deleteRate('/delete/rate_template', authenticate, ["ADMIN", "AGENT"])

DigitSemi.getDigitSemiIdAndStoreId('/get/digitsemi/:id/:store/:start/:end', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
DigitSemi.getDigitSemiMe('/get/digitsemi', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])// ดูเลขจ่ายครึ่งของร้านตัวเอง
DigitSemi.getDigitSemiAll('/get/digitsemi', authenticate, ["ADMIN"])// ดูเลขจ่ายครึ่งของทุกร้าน
DigitSemi.addDigitSemi('/add/digitsemi', authenticate, ["ADMIN", "AGENT"])
DigitSemi.updateDigitSemi('/add/digitsemi', authenticate, ["ADMIN", "AGENT"])
DigitSemi.deleteDigitSemi('/add/digitsemi', authenticate, ["ADMIN", "AGENT"])

DigitClose.getDigitCloseIdAndStoreId('/get/digitclose/:id/:store/:start/:end', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
DigitClose.getDigitCloseMe('/get/digitclose/me', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])
DigitClose.getDigitCloseAll('/get/digitclose/all', authenticate, ["ADMIN"])
DigitClose.addDigitClose('/add/digitclose', authenticate, ["ADMIN", "AGENT"])
DigitClose.updateDigitClose('/update/digitclose', authenticate, ["ADMIN", "AGENT"])
DigitClose.deleteDigitClose('/delete/digitclose', authenticate, ["ADMIN", "AGENT"])

// CheckReward.getCheckRewardId('/get/store', authenticate, ["ADMIN", "AGENT", "MANAGER"])
// CheckReward.getCheckRewardMe('/get/store', authenticate, ["ADMIN", "AGENT", "MANAGER"])
// :start = วันที่เริ่มต้น :end = วันที่สิ้นสุด
CheckReward.getCheckRewardAllWithDateStartEnd('/reward/lottos/:store/:start/:end', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])// ดูรางวัลตามวันที่
CheckReward.getCheckRewardId('/get/reward/:id', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])// ดูรางวัลตามวันที่
CheckReward.getCheckRewardAll('/get/reward/all', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])
CheckReward.getCheckRewardStore('/get/reward/store', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])
CheckReward.addCheckReward('/add/reward', authenticate, ["ADMIN", "AGENT", "MANAGE_REWARD"])
CheckReward.updateCheckReward('/update/reward', authenticate, ["ADMIN", "AGENT", "MANAGE_REWARD"])
CheckReward.deleteCheckReward('/delete/reward', authenticate, ["ADMIN", "AGENT", "MANAGE_REWARD"])
CheckReward.getCheckReward5Last('/get/reward/last/:id', authenticate, ["MEMBER"])

User.getUserWithStoreId('/users/:store', authenticate, ["ADMIN", "AGENT", "MANAGER"])// ดูผู้ใช้งานทั้งหมดของร้าน
User.getUserAll('/get/user/all', authenticate, ["ADMIN"])// ดูผู้ใช้งานทั้งหมด
User.getUserAllIsRole('/get/user/role/:role', authenticate, ["ADMIN"])// ดูผู้ใช้งานตำแหน่ง
User.getUserAllMe('/get/user/me', authenticate, ["ADMIN", "AGENT", "MANAGER"])// ดูผู้ใช้งานลูกข่ายตัวเอง
User.getMe('/me', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])// ดูข้อมูลตัวเอง
User.getCredit('/credit', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])// ดูข้อมูลตัวเอง
User.getUsername('/username', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD"])// ดูข้อมูลไอดี
User.getId('/id', authenticate, ["ADMIN"])// ดูข้อมูลไอดี

User.credit('/:excute/credit', authenticate, ["ADMIN", "AGENT", "MANAGER"])// เครดิต (เพิ่ม/ลบ)

User.statusAgent('/update/status/agent', authenticate, ["ADMIN"])// เครดิต (เพิ่ม/ลบ)
User.statusManager('/status/manager/:store', authenticate, ["ADMIN", "AGENT"])// เครดิต (เพิ่ม/ลบ)
User.statusMember('/status/member/:store', authenticate, ["ADMIN", "AGENT", "MANAGER"])// เครดิต (เพิ่ม/ลบ)

User.addUserAdmin('/add/admin')// เพิ่ม admin
User.addUserAgent('/add/agent', authenticate, ["ADMIN"])// เพิ่ม agent
User.addUserManager('/add/manager', authenticate, ["ADMIN", "AGENT"])// เพิ่ม manager
User.addUserMember('/add/member', authenticate, ["ADMIN", "AGENT", "MANAGER"])// เพิ่ม member

User.deleteUserAgent('/delete/agent', authenticate, ["ADMIN"])// ลบ agent
User.deleteUserManager('/delete/manager', authenticate, ["ADMIN", "AGENT"])// เพิ่ม manager
User.deleteUserMember('/delete/member', authenticate, ["ADMIN", "AGENT", "MANAGER"])// เพิ่ม member

User.login('/auth/login')// login
User.logout('/auth/logout', authenticate, ["ADMIN", "AGENT", "MANAGER", "MEMBER"])// logout

File.uploadFile('/upload/file', authenticate, ["ADMIN", "AGENT", "MANAGER"])
File.previewFile('/get/file/:file')
File.previewAllFiles('/images')

router.post('/auth/refresh', async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.body.refresh_token;
    if (!refresh_token) return res.sendStatus(401);
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET!, {
        algorithms: ["HS256"],
    }, async (err: any, decoded: string | jwt.JwtPayload | undefined | IToken) => {
        if (err) return res.sendStatus(401)
        const decode = decoded as IToken
        const access_token = createToken(decode.UID!, decode.tokenVersion!, decode.role)
        const refresh_token = refreshToken(decode.UID!, decode.tokenVersion!, decode.role)
        // const VITE_OPS_COOKIE_NAME = process.env.VITE_OPS_COOKIE_NAME!
        return res
            .status(200)
            .send({ access_token, refresh_token })
    })
})

// เหลือสร้าง ประกาศ (เช่น ประกาศว่าหวยนี้เลื่อนไปเปิดเวลาไหน)


// สร้าง admin
// admin สร้างหวย เวลาเปิด เวลาปิดรับหวย
// admin เพิ่ม agent
// agent เพิ่ม ร้าน
// agent กำหนดเรทการจ่ายของแต่ละหวย & ค่าคอมมิชชั่น
// agent เพิ่ม manager และเลือกว่า manager คนนี้จะคุมร้านไหน
// agent เพิ่ม credit ให้ manager
// manager เพิ่ม member
// manager เพิ่ม credit ให้ member
// member เพิ่มบิล
// รอผลออกและให้ MANAGE_REWARD เป็นคนกรอกผล
// router.post("/initial-database", (_, res: Response) => {
//     create_initial_database(res)
// })

router.get("/", (_: any, res: Response) => {
    res.send("Welcome to API")
})

APP.use("/", router)

server.listen(PORT, () => {
    console.log(`⚡️[server]: Example app listening on port ${PORT}`)
})
// export const handler = serverless(APP);
// export const handler: Handler = (event: any, context: any) => {
//     proxy(server, event, context);
// };
