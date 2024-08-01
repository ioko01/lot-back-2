export { };

declare global {
    interface ImportMetaEnv {
        VITE_OPS_DATABASE_HOST: string;
        VITE_OPS_DATABASE_USERNAME: string;
        VITE_OPS_DATABASE_PASSWORD: string;
        VITE_OPS_DATABASE_PORT: number;
        VITE_OPS_DATABASE_NAME: string;
        VITE_OPS_COOKIE_NAME: string;
        VITE_OPS_URL: string;
        VITE_OPS_URL_SOCKET: string;
    }
}
