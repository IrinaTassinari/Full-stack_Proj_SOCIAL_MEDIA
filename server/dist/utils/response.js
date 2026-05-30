export const sendSuccess = (res, statusCode, message, data = null) => {
    const payload = {
        success: true,
        message,
        data
    };
    return res.status(statusCode).json(payload);
};
export const sendError = (res, statusCode, message) => {
    const payload = {
        success: false,
        message
    };
    return res.status(statusCode).json(payload);
};
