import { NextFunction, Request, Response } from 'express'
import { router } from "../server";
import { TUserRole } from "../models/User";
import { authorization } from "../middleware/authorization";
import { HelperController } from "../helpers/Default";
import { IBillDoc, ICheckRewardDoc, ILottoDoc } from '../models/Id';
import { ICheckReward, ICheckRewardMySQL } from '../models/CheckReward';
import axios from "axios";
import * as cheerio from "cheerio";
import { ILottoMySQL } from '../models/Lotto';
import moment from 'moment';
import { v4 } from 'uuid';
import { getTomorrow } from '../utils/time';

const Helpers = new HelperController()

export class ApiGetCheckReward {

    // หุ้นไต้หวัน -- https://www.twse.com.tw/res/data/zh/home/summary.json
    apiTaiwan = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        if (api) {
            if (api.SHDATE?.split("/")[2].toString() == date_now.getDate().toString()) {
                let top: string = api.TSE_I?.toString()
                top = parseFloat(top).toFixed(2)
                let bottom: string = api.TSE_D?.toString()
                bottom = parseFloat(bottom).toFixed(2)
                const top_filter = top.replace(".", "").substring(top.replace(".", "").length - 3, top.replace(".", "").length)
                const bottom_filter = bottom.replace(".", "").substring(bottom.replace(".", "").length - 2, bottom.replace(".", "").length)

                if (top_filter && bottom_filter) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top_filter, bottom_filter)
            }
        }
    }


    // --- EXAMPLE FORMAT ---
    // {
    //     "status": "success",
    //     "data": {
    //       "show_1st": "2024-03-28 12:30",
    //       "start_spin": "2024-03-28 12:00",
    //       "show_2nd": "2024-03-28 12:15",
    //       "lotto_date": "2024-03-28",
    //       "results": {
    //         "prize_4th_1": "07855",
    //         "prize_4th_2": "90342",
    //         "prize_5th_3": "2104",
    //         "prize_4th_3": "44430",
    //         "prize_5th_4": "3864",
    //         "prize_2digits_4": "84",
    //         "prize_4th_4": "80628",
    //         "prize_5th_1": "3807",
    //         "prize_4th_5": "49688",
    //         "prize_5th_2": "8787",
    //         "prize_4th_6": "78312",
    //         "prize_7th_3": "188",
    //         "prize_7th_1": "715",
    //         "prize_7th_2": "866",
    //         "prize_1st": "98155",
    //         "prize_6th_1": "2816",
    //         "prize_6th_6": "0937",
    //         "prize_3rd_2": "45585",
    //         "prize_3rd_1": "24892",
    //         "prize_2nd": "41514",
    //         "prize_6th_2": "8530",
    //         "prize_6th_3": "7939",
    //         "prize_6th_4": "5400",
    //         "prize_6th_5": "6477",
    //         "prize_2digits_3": "32",
    //         "prize_2digits_2": "92",
    //         "prize_2digits_1": "01"
    //       }
    //     },
    //     "update": "2024-03-29T02:28:00.088Z"
    //   }

    // ฮานอยสตาร์ -- https://api.minhngocstar.com/result
    // ฮานอย HD -- https://api.xosohd.com/result
    // ฮานอย TV -- https://api.minhngoctv.com/result
    // ฮานอยกาชาด -- https://api.xosoredcross.com/result
    // อังกฤษ VIP -- https://gcp.lottosuperrich.com/result/gb
    // เยอรมัน VIP -- https://gcp.lottosuperrich.com/result/de
    // รัสเซีย VIP -- https://gcp.lottosuperrich.com/result/ru
    // ดาวโจนส์ VIP -- https://api.dowjonespowerball.com/result
    // ดาวโจนส์ Star -- https://api.dowjonestar.com/result
    // ฮานอย Extra -- https://api.xosoextra.com/result
    // ฮานอยสามัคคี -- https://api.xosounion.com/api/result
    // ฮานอยพัฒนา -- https://api.xosodevelop.com/api/result
    // ฮานอยอาเซียน -- https://gg.hanoiasean.com/api/result
    apiMain = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        if (api.data?.results) {
            if (new Date(api.data?.lotto_date).getDate() == date_now.getDate()) {
                const top = api.data.results?.prize_1st?.substring(2, 5)
                const bottom = api.data.results?.prize_2nd?.substring(3, 5)
                if (top && bottom) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top, bottom)
            }
        }
    }


    // --- EXAMPLE FORMAT ---
    // {
    //     "status": "success",
    //     "data": {
    //       "start_spin": "2024-03-28 23:25:00",
    //       "lotto_date": "2024-03-28",
    //       "show_result": "2024-03-28 23:30:00",
    //       "results": {
    //         "digit2_top": "54",
    //         "digit5": "12554",
    //         "digit1": "4",
    //         "digit3": "554",
    //         "digit2_special": "44",
    //         "digit4": "2554",
    //         "digit2_bottom": "12"
    //       }
    //     },
    //     "now": "2024-03-29 09:31:47",
    //     "update": "2024-03-29 09:26:45"
    //   }

    // ลาวสตาร์ -- https://api.laostars.com/result
    // ลาว Extra -- https://api.laoextra.com/result
    // ลาว TV -- https://api.lao-tv.com/result
    // ลาวสามัคคี -- https://public-api.laounion.com/result
    // ลาวสามัคคี VIP -- https://api.laounionvip.com/result
    // ลาวกาชาด -- https://api.lao-redcross.com/result
    // ลาว HD -- https://api.laoshd.com/api/result
    // ลาวอาเซียน -- https://hi.lotterylaosasean.com/result
    // ลาวประตูชัย -- https://api.laopatuxay.com/result
    // ลาวสันติภาพ -- https://api.laosantipap.com/result
    // ประชาชนลาว -- https://api.laocitizen.com/result

    // ดาวโจนส์ Midnight -- https://api.dowjones-midnight.com/result
    // ดาวโจนส์ Extra -- https://api.dowjonesextra.com/result
    // ดาวโจนส์ TV -- https://api.tvdowjones.com/result
    apiMain2 = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        if (api.data?.results) {
            let top = ""
            let bottom = ""
            let digits = ""
            if (new Date(api.data?.lotto_date).getDate() == date_now.getDate()) {
                if (api.data.results?.digit3 && api.data.results?.digit2_bottom) {
                    top = api.data.results?.digit3
                    bottom = api.data.results?.digit2_bottom
                } else if (api.data.results?.digit5 && !api.data.results?.digit3 && !api.data.results?.digit2_bottom) { // ดาวโจนส์ Midnight, ดาวโจนส์ Extra, ดาวโจนส์ TV
                    digits = api.data.results?.digit5?.toString()
                    top = digits.substring(digits.length - 3, digits.length)
                    bottom = digits.substring(0, 2)
                }

                if (top && bottom) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top, bottom)
            }
        }
    }

    // ฮานอย -- https://mlnhngo.net/special.data.mlnhngoc.net
    apiHanoi = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        // console.log(api);
        // if (api.data?.results) {
        //     if (new Date(api.data?.lotto_date).getDate() == date_now.getDate()) {
        //         const top = api.data.results?.digit3
        //         const bottom = api.data.results?.digit2_bottom
        //         if (top && bottom) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times, check_times_end, top, bottom)
        //     }
        // }
    }

    // ลาวสตาร์ VIP -- https://www.laostarsvip.com/laostarsvip/
    apiLaosStarVIP = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        if (new Date(api?.VIP).getDate() == date_now.getDate()) {
            const top = api?.O3
            const bottom = api?.O5
            if (top && bottom) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top, bottom)
        }
    }

    // นิเคอิเช้า VIP -- https://api.nikkeivipstock.com/api/jp?t=morning
    // นิเคอิบ่าย VIP -- https://api.nikkeivipstock.com/api/jp?t=evening
    // จีนเช้า VIP --  https://api.shenzhenindex.com/api/cn?t=morning
    // จีนบ่าย VIP --  https://api.shenzhenindex.com/api/cn?t=evening
    // ฮั่งเส็งเช้า VIP --  https://api.hangsengvip.com/api/hk?t=morning
    // ฮั่งเส็งบ่าย VIP --  https://api.hangsengvip.com/api/hk?t=evening
    // ไต้หวัน VIP --  https://api.tsecvipindex.com/api/tw
    // เกาหลี VIP --  https://api.ktopvipindex.com/api/kr
    // สิงคโปร์ VIP --  https://api.stocks-vip.com/api/sg
    apiVIP = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date, morning_and_evening: string | null) => {
        if (api.data) {
            if (new Date(api.data?.date).getDate() == date_now.getDate()) {
                let top = ""
                let bottom = ""
                let top_filter = ""
                let bottom_filter = ""
                try {
                    if (api.data?.prices) {
                        api.data?.prices.map((p: any,) => {

                            // เช้า
                            if (morning_and_evening == "morning") {
                                if (p.note?.toLocaleLowerCase() == "Morning-Close".toLocaleLowerCase()) {
                                    top = p.price?.toString()
                                    top = parseFloat(top).toFixed(2)
                                    bottom = p.diff?.toString()
                                    bottom = parseFloat(bottom).toFixed(2)

                                    top_filter = top.replace(".", "").substring(top.replace(".", "").length - 3, top.replace(".", "").length)
                                    bottom_filter = bottom.replace(".", "").substring(bottom.replace(".", "").length - 2, bottom.replace(".", "").length)
                                }
                            }

                            // บ่าย
                            if (morning_and_evening == "evening") {
                                if (p.note?.toLocaleLowerCase() == "Close".toLocaleLowerCase()) {
                                    top = p.price?.toString()
                                    top = parseFloat(top).toFixed(2)
                                    bottom = p.diff?.toString()
                                    bottom = parseFloat(bottom).toFixed(2)

                                    top_filter = top.replace(".", "").substring(top.replace(".", "").length - 3, top.replace(".", "").length)
                                    bottom_filter = bottom.replace(".", "").substring(bottom.replace(".", "").length - 2, bottom.replace(".", "").length)
                                }
                            }
                        })
                    }


                    if (top_filter && bottom_filter) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top_filter, bottom_filter)
                } catch (error) {

                }

            }
        }
    }

    // หุ้นเวียดนาม VIP -- https://api.vnindexvip.com/prices
    apiVietnamVIP = async (res: Response, api: any, lotto_id: string, date_now: Date, check_times_start: Date, check_times_end: Date) => {
        if (api.data) {
            if (new Date(api.data?.date).getDate() == date_now.getDate()) {
                let top = ""
                let bottom = ""
                if (api.data?.awards?.sec1) {
                    top = api.data?.awards?.sec1?.three
                    bottom = api.data?.awards?.sec1?.two
                }

                if (api.data?.awards?.sec2) {
                    top = api.data?.awards?.sec2?.three
                    bottom = api.data?.awards?.sec2?.two
                }

                if (api.data?.awards?.sec3) {
                    top = api.data?.awards?.sec3?.three
                    bottom = api.data?.awards?.sec3?.two
                }

                if (top && bottom) await this.insertAndUpdateCheckRewards(res, lotto_id, check_times_start, check_times_end, top, bottom)
            }
        }
    }

    insertAndUpdateCheckRewards = async (res: Response, lotto_id: string, check_times_start: Date, check_times_end: Date, top: string, bottom: string) => {
        const attr2 = ["check_reward_id", "lotto_id", "top", "bottom", "times"]
        const value2 = [v4(), lotto_id, top, bottom, check_times_start]
        await Helpers.insert_database("check_rewards", attr2, value2)
            .then(async () => {
                const attr = [["status", "=", "REWARD"]]
                const where = [
                    ["lotto_id", "=", lotto_id],
                    ["times", ">=", check_times_start],
                    ["times", "<=", check_times_end],
                    ["status", "=", "WAIT"]
                ]
                await Helpers.update_database_where("bills", attr, where)
                try {
                    res.json({ statusCode: res.statusCode, message: "OK" })
                } catch (error) {
                    res.json({ statusCode: res.statusCode, message: error })
                }
            })
            .catch(error => {
                // res.send({ statusCode: res.statusCode, message: error })
            })
    }

    apiGetResultAll = (url: string, middleware: (req: Request, res: Response, next: NextFunction) => void, roles: TUserRole[]) => {
        router.get(url, middleware, async (req: Request, res: Response) => {
            try {
                const authorize = await authorization(req, roles)
                if (authorize) {
                    if (authorize !== 401) {
                        const lottos = await Helpers.select_database("lottos", "*, CONVERT_TZ(NOW(),'+00:00','+07:00') AS now") as ILottoMySQL[]
                        if (!lottos) return res.status(202).json({ message: "don't have lotto" })

                        const m_la = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']
                        const m_eng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

                        lottos.map(async (lot) => {
                            const date = moment(new Date(lot.now).toUTCString()).utc()

                            let year = date.format("YYYY")
                            let day = date.format("DD")
                            let day_not_sub = date.format("DD")
                            let month = date.format("MM")
                            let hour = date.format("HH")
                            let minute = date.format("mm")
                            let second = date.format("ss")

                            if (new Date(`${year}-${month}-${day_not_sub}T${lot.close}:00.000Z`) < new Date(`${year}-${month}-${day_not_sub}T${lot.open}:00.000Z`)) {
                                day = date.subtract(1, 'days').get('date').toString()
                            }

                            const time_now = new Date(`${year}-${month}-${day_not_sub}T${hour}:${minute}:${second}.000Z`)
                            const date_now = new Date(`${year}-${month}-${day_not_sub}`)
                            const times = new Date(`${year}-${month}-${day} 00:00:00`)
                            const check_times_start = new Date(`${year}-${month}-${day} 00:00:00`)
                            const check_times_end = new Date(`${year}-${month}-${day} 23:59:59`)
                            const report_add_minute = moment(new Date(`${year}-${month}-${day}T${lot.report}:00.000Z`))

                            if (lot.groups == "หวยหุ้น") {
                                minute = report_add_minute.add(5, 'minutes').get('minutes').toString()
                            } else {
                                // minute = report_add_minute.add(2, 'minutes').get('minutes').toString()
                            }

                            if (parseInt(minute) < 10) {
                                minute = `0${minute}`
                            }
                            const time_result = new Date(`${year}-${month}-${day}T${lot.report.split(":")[0]}:${minute}:00.000Z`)

                            if (lot.api != '') {
                                if (time_now >= time_result) {
                                    const [check_reward] = await Helpers.select_database_where("check_rewards", "top, bottom, times", [["lotto_id", "=", lot.lotto_id], ["times", "=", times]]) as ICheckRewardMySQL[]
                                    if (!check_reward) {
                                        const response = await axios.get(lot.api!);
                                        const api = response.data
                                        const url_get_params = new URL(lot.api!)
                                        this.apiMain(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)
                                        this.apiMain2(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)
                                        this.apiVIP(res, api, lot.lotto_id, date_now, check_times_start, check_times_end, url_get_params.searchParams.get("t"))
                                        this.apiVietnamVIP(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)
                                        this.apiTaiwan(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)
                                        this.apiHanoi(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)
                                        this.apiLaosStarVIP(res, api, lot.lotto_id, date_now, check_times_start, check_times_end)

                                    }
                                }
                            }
                        })

                        res.status(200).json("OK")

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

}
