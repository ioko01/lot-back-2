
export const getPath = () => {
    if (process.env.NODE_ENV == 'production') {
        return "./dist/uploads/"
    } else {
        return "./src/uploads/"
    }
}