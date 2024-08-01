export const validateUsername = (username: string) => {
    const formatUsername = username.trim();
    return formatUsername.length > 5 && formatUsername.length < 13;
};

export const validatePassword = (password: string) =>
    password.length > 7 && password.length < 17;