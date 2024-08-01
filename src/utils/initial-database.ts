import { PoolConnection } from "mysql2/typings/mysql/lib/PoolConnection";
import { connection } from "./database";
import async from "async";
import { Response } from "express";

export const create_initial_database = (res: Response) => {
    connection.getConnection((err: NodeJS.ErrnoException | null, conn: PoolConnection) => {
        if (err) throw err
        // const q0 = `SET GLOBAL time_zone = '+7:00';`
        const q1 = `
        CREATE TABLE IF NOT EXISTS users(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            user_id VARCHAR(255) NOT NULL COMMENT "ไอดีผู้ใช้งาน",
            store_id VARCHAR(255) NULL COMMENT "ไอดีร้านค้า",
            username VARCHAR(50) NOT NULL COMMENT "ไอดีผู้ใช้งานสำหรับเข้าสู่ระบบ",
            u_password VARCHAR(255) NOT NULL COMMENT "รหัสผ่าน",
            fullname VARCHAR(255) NOT NULL COMMENT "ชื่อ - สกุล",
            role ENUM("ADMIN", "AGENT", "MANAGER", "MEMBER", "MANAGE_REWARD") NOT NULL DEFAULT "MEMBER" COMMENT "ตำแหน่ง",
            status ENUM("REGULAR", "CLOSED", "BANNED") NOT NULL DEFAULT "REGULAR" COMMENT "สถานะ",
            credit INT DEFAULT 0 COMMENT "เครดิต",
            tokenVersion INT DEFAULT 1 COMMENT "เวอร์ชั่นโทเคน",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "ผู้ใช้งาน";
        `;
        const q2 = `
        CREATE TABLE IF NOT EXISTS stores(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            store_id VARCHAR(255) NOT NULL COMMENT "ไอดีร้านค้า",
            name VARCHAR(255) NOT NULL COMMENT "ชื่อร้านค้า",
            logo VARCHAR(255) NOT NULL COMMENT "โลโก้",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "ร้านค้า";
        `;
        const q3 = `
        CREATE TABLE IF NOT EXISTS rates(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            rate_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีหวย",
            store_id VARCHAR(255) NOT NULL COMMENT "ไอดีร้านค้า",
            commission_id VARCHAR(255) NOT NULL COMMENT "ไอดีค่าคอมมิชชั่น",
            rate_template_id VARCHAR(255) NOT NULL COMMENT "ไอดีเทมเพลตเรทราคา",
            digit_close_id VARCHAR(255) NULL COMMENT "ไอดีเลขปิดรับ",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "เรทราคา";
        `;
        const q4 = `
        CREATE TABLE IF NOT EXISTS lottos(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            store_id VARCHAR(255) NOT NULL COMMENT "ไอดีร้านค้า",
            name VARCHAR(255) NOT NULL COMMENT "ชื่อหวย",
            img_flag VARCHAR(255) NOT NULL COMMENT "สัญลักษณ์หวย(ธง)",
            open VARCHAR(20) NOT NULL COMMENT "เวลาเปิดรับ",
            close VARCHAR(20) NOT NULL COMMENT "เวลาปิดรับ",
            report VARCHAR(20) NOT NULL COMMENT "เวลาผลออก",
            status ENUM("OPEN", "CLOSE") NOT NULL DEFAULT "OPEN" COMMENT "สถานะหวย",
            date_type ENUM("SELECT_DATE", "THAI") NOT NULL DEFAULT "SELECT_DATE" COMMENT "ชนิดวันหวยออก",
            date_open JSON DEFAULT "{}" COMMENT "วันเปิดรับ ['sunday', 'monday' ,...]",
            thai_open_date VARCHAR(255) NULL COMMENT "วันหวยออกของไทย",
            api TEXT NULL COMMENT "ลิงก์ API",
            groups VARCHAR(255) NULL COMMENT "กลุ่มหวย",
            promotion ENUM("USED", "NOT_USED") DEFAULT "NOT_USED" COMMENT "สถานะโปรโมชั่น",
            modify_commission ENUM("YES", "NO") DEFAULT "NO" COMMENT "จัดการค่าคอม ฯ ด้วยตนเอง",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "หวย";
        `;
        const q5 = `
        CREATE TABLE IF NOT EXISTS digits_semi(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            digit_semi_id VARCHAR(255) NOT NULL COMMENT "ไอดีเลขจ่ายครึ่ง",
            store_id VARCHAR(255) NULL COMMENT "ไอดีร้านค้า",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            rate_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            times DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT "งวดที่ออก",
            percent INT NULL DEFAULT 50 COMMENT "เปอร์เซ้นต์การจ่าย ค่าเริ่มต้น 50",
            one_digits JSON DEFAULT "{}" COMMENT "วิ่ง ==> {top: [1, 2, 3], bottom: [1, 2, 3]}",
            two_digits JSON DEFAULT "{}" COMMENT "2 ตัว {top: [01, 22, 63], bottom: [81, 52, 63]}",
            three_digits JSON DEFAULT "{}" COMMENT "3 ตัว {top: [051, 222, 631], toad:[831, 542, 673]}",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "เลขจ่ายครึ่ง";
        `;
        const q6 = `
        CREATE TABLE IF NOT EXISTS digits_close(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            digit_close_id VARCHAR(255) NOT NULL COMMENT "ไอดีเลขปิดรับ",
            store_id VARCHAR(255) NULL COMMENT "ไอดีร้านค้า",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            rate_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            times DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT "งวดที่ออก",
            percent INT NULL DEFAULT 0 COMMENT "เปอร์เซ้นต์การจ่าย ค่าเริ่มต้น 0",
            one_digits JSON DEFAULT "{}" COMMENT "วิ่ง ==> {top: [1, 2, 3], bottom: [1, 2, 3]}",
            two_digits JSON DEFAULT "{}" COMMENT "2 ตัว {top: [01, 22, 63], bottom: [81, 52, 63]}",
            three_digits JSON DEFAULT "{}" COMMENT "3 ตัว {top: [051, 222, 631], toad:[831, 542, 673]}",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "เลขปิดรับ";
        `;
        const q7 = `
        CREATE TABLE IF NOT EXISTS commissions(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            commission_id VARCHAR(255) NOT NULL COMMENT "ไอดีค่าคอมมิชชั่น",
            one_digits JSON DEFAULT "{}" COMMENT "ค่าคอมเลขวิ่ง ค่าคอมบน/ค่าคอมล่าง ==> {top:3, bottom: 4}",
            two_digits JSON DEFAULT "{}" COMMENT "ค่าคอมเลข 2 ตัว ค่าคอมบน/ค่าคอมล่าง ==> {top:95, bottom:95}",
            three_digits JSON DEFAULT "{}" COMMENT "ค่าคอมเลข 3 ตัว  ค่าคอมบน/ค่าคอมโต๊ด ==> {top:800, toad:125}",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "ค่าคอมมิชชั่น";
        `;
        const q8 = `
        CREATE TABLE IF NOT EXISTS check_rewards(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            check_reward_id VARCHAR(255) NOT NULL COMMENT "ไอดีตรวจรางวัล",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            times DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT "งวดที่ออก",
            top VARCHAR(3) NOT NULL COMMENT "ผลที่ออก 153",
            bottom VARCHAR(2) NOT NULL COMMENT "ผลที่ออก 68",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "ตรวจรางวัล";
        `;
        const q9 = `
        CREATE TABLE IF NOT EXISTS bills(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            bill_id VARCHAR(255) NOT NULL COMMENT "ไอดีตรวจรางวัล",
            store_id VARCHAR(255) NULL COMMENT "ไอดีร้านค้า",
            lotto_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            rate_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            times DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT "งวดที่ออก",
            one_digits JSON DEFAULT "{}" COMMENT "เลขวิ่ง ตัวเลข/ราคาบน/ราคาล่าง ==> [1:5000:5000, 3:5000:0]",
            two_digits JSON DEFAULT "{}" COMMENT "เลข 2 ตัว ตัวเลข/ราคาบน/ราคาล่าง [01:5:5, 10:5:5, 02:10:5, 20:10:5]",
            three_digits JSON DEFAULT "{}" COMMENT "เลข 3 ตัว ตัวเลข/ราคาบน/ราคาจ่ายโต๊ด [011:5:5, 101:5:5, 025:5:5, 205:5:5]",
            note VARCHAR(255) NULL COMMENT "หมายเหตุ",
            status ENUM("WAIT", "CANCEL", "REWARD") NULL DEFAULT "WAIT" COMMENT "สถานะ",
            price VARCHAR(255) DEFAULT "0" COMMENT "ราคาบิล",
            win VARCHAR(255) DEFAULT "0" COMMENT "ถูกรางวัล",
            rebate VARCHAR(255) DEFAULT "0" COMMENT "ส่วนลด",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "ตรวจรางวัล";
        `;
        const q10 = `
        CREATE TABLE IF NOT EXISTS rates_template(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            rate_template_id VARCHAR(255) NOT NULL COMMENT "ไอดีเรทราคา",
            commission_id VARCHAR(255) NOT NULL COMMENT "ไอดีค่าคอมมิชชั่น",
            store_id VARCHAR(255) NOT NULL COMMENT "ไอดีร้าน",
            name VARCHAR(255) NOT NULL COMMENT "ชื่อเทมเพลท",
            one_digits JSON DEFAULT "{}" COMMENT "ราคาจ่ายเลขวิ่ง ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:3, bottom: 4}",
            two_digits JSON DEFAULT "{}" COMMENT "ราคาจ่ายเลข 2 ตัว ราคาจ่ายบน/ราคาจ่ายล่าง ==> {top:95, bottom:95}",
            three_digits JSON DEFAULT "{}" COMMENT "ราคาจ่ายเลข 3 ตัว  ราคาจ่ายบน/ราคาจ่ายโต๊ด ==> {top:800, toad:125}",
            bet_one_digits JSON DEFAULT "{}" COMMENT "อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลขวิ่ง ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}",
            bet_two_digits JSON DEFAULT "{}" COMMENT "อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 2 ตัว ==> {top: 1:100000:100000, bottom: 1:100000:100000, toad: 1:100000:100000}",
            bet_three_digits JSON DEFAULT "{}" COMMENT "อัตาแทงต่ำสุด/สูงสุด/รับได้เยอะสุด เลข 3 ตัว ==> {top: 1:100000:100000, bottom: 0:0:0, toad: 1:100000:100000}",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "เทมเพลทเรทราคา";
        `;
        const q11 = `
        CREATE TABLE IF NOT EXISTS promotions(
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT "เลขรัน",
            promotion_id VARCHAR(255) NOT NULL COMMENT "ไอดีโปรโมชั่น",
            name VARCHAR(255) NOT NULL COMMENT "ชื่อโปรโมชั่น",
            store_id VARCHAR(255) NOT NULL COMMENT "ไอดีร้านค้า",
            rate_template_id VARCHAR(255) NOT NULL COMMENT "ไอดีเทมเพลตเรทราคา",
            date_promotion JSON DEFAULT "{}" COMMENT "วันที่จัดโปรโมชั่น",
            status ENUM("USED", "NOT_USED") DEFAULT "NOT_USED" COMMENT "สถานะการใช้งาน",
            user_create_id VARCHAR(255) COMMENT "ไอดีผู้สร้าง",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=INNODB CHARACTER SET utf8 COMMENT "โปรโมชั่น";
        `;
        const resp_data: {} = {};

        async.parallel([
            // (parallel_done) => {
            //     conn.query(q0, (error, result) => {
            //         if (error) return parallel_done(err);
            //         Object.assign(resp_data, { t0: result })
            //         parallel_done();
            //     })
            // },
            (parallel_done) => {
                conn.query(q1, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t1: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q2, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t2: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q3, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t3: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q4, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t4: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q5, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t5: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q6, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t6: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q7, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t7: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q8, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t8: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q9, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t9: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q10, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t10: result })
                    parallel_done();
                })
            },
            (parallel_done) => {
                conn.query(q11, (error, result) => {
                    if (error) return parallel_done(err);
                    Object.assign(resp_data, { t11: result })
                    parallel_done();
                })
            },
        ], (err) => {
            if (err) console.log(err);
            conn.release();
            res.status(200).json({
                message: 'OK',
            })
        })

    });
}
