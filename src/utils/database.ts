import { config } from "dotenv";
import { createPool } from "mysql2";

config()
export const connection = createPool({
    host: process.env.VITE_OPS_DATABASE_HOST,
    user: process.env.VITE_OPS_DATABASE_USERNAME,
    password: process.env.VITE_OPS_DATABASE_PASSWORD,
    database: process.env.VITE_OPS_DATABASE_NAME,
    port: parseInt(process.env.VITE_OPS_DATABASE_PORT!)
})

// CONVERT_TZ(NOW(),'+00:00','+07:00') AS d_now