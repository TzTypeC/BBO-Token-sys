const { checkTokenId }= require('./checkToken');
const checkClientInfo = require('./checkClientInfo');

const validateToken = async (hashedToken, deviceId) => {
    try {
        let errors = {};
        const tokenId = await checkTokenId(hashedToken);

        if (tokenId == null) {
            errors.token = ["Token tidak ditemukan atau tidak terdaftar."]
            return {
                statusCode: 404,
                success: false,
                errors,
                message: "Token tidak ditemukan"
            };
        }

        return await checkClientInfo(tokenId, deviceId);

    } catch (error) {
        console.error("❌ Error validateToken:", error.message, error.stack);
        return { statusCode: 500, success: false, message: "Terjadi kesalahan saat validasi token" };
    }
};

module.exports = validateToken;
