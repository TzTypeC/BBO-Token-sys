const generateToken = require('../utils/generateToken');
const { setResponse, response, errorResponse } = require('../utils/response');
const checkTokenExists = require('../utils/checkTokenExists');
const storeToken = require('../utils/storeToken');
const { hash, encrypt } = require('./cryptography');

const generateTokenHandler = async (req, res) => {
    try {
        setResponse(res);

        const { client, customToken } = req.body;
        let token, hashedToken;
        let errors = {};

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

        const { encrypted, iv } = encrypt(token);
        const { success, message } = await storeToken(hashedToken, encrypted, iv, client);

        const expiredDate = new Date(Date.now() + 60 * 60 * 24 * 6 * 1000);
        const formattedDate = `${expiredDate.getDate().toString().padStart(2, "0")}-${(expiredDate.getMonth() + 1).toString().padStart(2, "0")}-${expiredDate.getFullYear()}`;

        const payload = {
            token,
            client_name: client,
            expired: formattedDate,
        };

        return success ? response(201, message, payload) : response(500, message, payload);

    } catch (error) {
        console.error(error);
        return errorResponse(500, "Terjadi kesalahan server.", { error: [error.message] });
    }
};

module.exports = { generateTokenHandler };
