import { config } from "dotenv";
import { createPool } from "mysql2";

config()
export const connections = createPool({
    host: process.env.VITE_OPS_DATABASE_HOST,
    user: process.env.VITE_OPS_DATABASE_USERNAME,
    password: process.env.VITE_OPS_DATABASE_PASSWORD,
    database: process.env.VITE_OPS_DATABASE_NAME,
    port: parseInt(process.env.VITE_OPS_DATABASE_PORT!),
})
// waitForConnections: true,
// connectionLimit: 1000,
// maxIdle: 1000, // max idle connections, the default value is the same as `connectionLimit`
// idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
// queueLimit: 0,
// enableKeepAlive: true,

// CONVERT_TZ(NOW(),'+00:00','+07:00') AS d_now