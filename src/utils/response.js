const { getReasonPhrase } = require("http-status-codes");

let globalRes = null;

const setResponse = (res) => {
    globalRes = res;
};

// const statusCode = (httpStatusCode) => getReasonPhrase(httpStatusCode);
const statusCode = (httpStatusCode) => {
    if (!httpStatusCode) return "Unknown";
    // console.log(httpStatusCode);
    return getReasonPhrase(httpStatusCode);
};


const response = (status, message, data) => {
    if (!globalRes) throw new Error("Response object is not set!");
    
    globalRes.status(status).json({
            code: status,
            status: statusCode(status),
            payload: data,
            message,
        },
    );
};

const errorResponse = (status, message, errorList) => {
    if (!globalRes) throw new Error("Response object is not set!");

    globalRes.status(status).json({
            code: status,
            status: statusCode(status),
            error: errorList,
            message,
        },
    );
};

module.exports = { setResponse, response, errorResponse };
