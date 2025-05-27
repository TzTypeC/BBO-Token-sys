const generateToken = require('../utils/generateToken');
const { setResponse, response, errorResponse } = require('../utils/response');
const { checkTokenExists } = require('../utils/checkToken');
const storeToken = require('../utils/storeToken');
const validateToken = require('../utils/validateToken');
const { hash, encrypt } = require('./cryptography');

const generateTokenHandler = async (req, res) => {
    try {
        setResponse(res);

        const { client, customToken, timeToExpiredRaw } = req.body;
        let token, hashedToken;
        let errors = {};
        const timeToExpired = timeToExpiredRaw.trim();

        // Validasi client (tidak boleh kosong)
        if (!client || client.trim() === "") {
            errors.client = ["Client tidak boleh kosong."];
        }

        // Validasi customToken jika diinputkan
        if (customToken && customToken.trim() !== "") {
            // Hanya boleh huruf besar/kecil dan angka
            if (!/^[a-zA-Z0-9]+$/.test(customToken.trim())) {
                errors.customToken = ["Custom token hanya boleh mengandung huruf dan angka."];
            } else {
                token = customToken.trim();
                hashedToken = hash(token);

                // Cek apakah token sudah digunakan
                if (await checkTokenExists(hashedToken)) {
                    errors.customToken = errors.customToken || [];
                    errors.customToken.push("Token sudah digunakan, pilih token lain.");
                }
            }
        }

        // Jika ada error, kirimkan error response
        if (Object.keys(errors).length > 0) {
            return errorResponse(400, "Validasi gagal.", errors);
        }

        // Jika tidak ada custom token, buat token baru
        if (!token) {
            ({ token, hashedToken } = await generateToken());
        }
        
        const now = new Date();
        const unFormattedExpiredDate = new Date(now.getTime() + timeToExpired * 24 * 60 * 60 * 1000);
        const formatted = unFormattedExpiredDate.toISOString().split("T")[0];
        const expiredDate = formatted;
        // const formattedDate = `${unFormattedExpiredDate.getDate().toString().padStart(2, "0")}-${(unFormattedExpiredDate.getMonth() + 1).toString().padStart(2, "0")}-${unFormattedExpiredDate.getFullYear()}`;

        const { encrypted, iv } = encrypt(token);
        const { success, message } = await storeToken(hashedToken, encrypted, iv, client, expiredDate);


        const payload = {
            token,
            client_name: client,
            expired: expiredDate,
        };

        return success ? response(201, message, payload) : response(500, message, payload);

    } catch (error) {
        console.error(error);
        return errorResponse(500, "Terjadi kesalahan server.", { error: [error.message] });
    }
};

const validateTokenHandler = async (req, res) => {
    try {
        setResponse(res);

        const rawDeviceId = req.query.deviceId;
        const rawTokenId = req.query.tokenId;
        let errors = {};

        if (!rawDeviceId || rawDeviceId.trim() === "") {
            errors.device = ["Kesalahan Pembacaan Device"];
        }

        if (!rawTokenId || rawTokenId.trim() === "") {
            errors.token = ["Token tidak boleh kosong."];
        }

        if (Object.keys(errors).length > 0) {
            return errorResponse(400, "Validasi gagal.", errors);
        }

        const deviceId = rawDeviceId.trim();
        const token = rawTokenId.trim();
        const hashedToken = hash(token);

        const result = await validateToken(hashedToken, deviceId);
        const { statusCode, success, message } = result;
        // console.log(result);

        if(success){
            payload = result.payload;
            payload.token = token
            return response(statusCode , message,payload);
        } else {
            errors = result.errors;
            return errorResponse(statusCode, message, errors);
        }

    } catch (error) {
        console.error(error);
        return errorResponse(500, "Terjadi kesalahan server.", { error: [error.message] });
    }
};

module.exports = { generateTokenHandler, validateTokenHandler };
