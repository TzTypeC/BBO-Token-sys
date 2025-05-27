const pool = require('../config/db');
const isTokenExpired = require('./isTokenExpired');

// Format ke "YYYY-MM-DD HH:mm:ss"
const formatDateToSQL = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

const getFormattedNow = () => formatDateToSQL(new Date());

// Ambil device_id & expired_at dari DB berdasarkan tokenId
const getInfoClientByTokenId = async (connection, tokenId) => {
    const [rows] = await connection.execute(
        "SELECT device_id, last_logged, expired_at, client FROM client_info WHERE token_id = ?",
        [tokenId]
    );
    if (rows.length > 0) {
        return {
            deviceIdFromDB: rows[0].device_id,
            expiredDateFromDB: rows[0].expired_at,
            lastLoggedFromDB: rows[0].last_logged,
            clientFromDB: rows[0].client
        };
    }
    return null;
};

// Update last_logged
const updateLastLogged = async (connection, tokenId) => {
    await connection.execute(
        "UPDATE client_info SET last_logged = ? WHERE token_id = ?",
        [getFormattedNow(), tokenId]
    );
};

// Update device_id & last_logged
const updateDeviceIdAndLastLogged = async (connection, tokenId, deviceId) => {
    await connection.execute(
        "UPDATE client_info SET last_logged = ?, device_id = ? WHERE token_id = ?",
        [getFormattedNow(), deviceId, tokenId]
    );
};

// Fungsi utama
const checkClientInfo = async (tokenId, deviceId) => {
    let connection;
    let errors = {};
    try {

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const result = await getInfoClientByTokenId(connection, tokenId);

        if (!result) {
            await connection.rollback();
            errors.token = ["Token tidak ditemukan atau tidak terdaftar."]
            return {
                statusCode: 404,
                success: false,
                errors,
                message: "Token tidak ditemukan"
            };
        }

        const { deviceIdFromDB, expiredDateFromDB, lastLoggedFromDB, clientFromDB  } = result;
        const currentTimeLogin = getFormattedNow();
        const formattedLastLogged = lastLoggedFromDB ? formatDateToSQL(lastLoggedFromDB) : null;


        if (isTokenExpired(expiredDateFromDB)) {
            await connection.rollback();
            errors.token = ["Token sudah kedaluwarsa."]
            return {
                statusCode: 401,
                success: false,
                errors,
                message: "Token sudah kedaluwarsa"
            };
        }

        if (deviceIdFromDB && deviceIdFromDB === deviceId) {
            await updateLastLogged(connection, tokenId);
            await connection.commit();
            return {
                statusCode: 200,
                success: true,
                payload: {
                    client: clientFromDB,
                    currentTimeLogin: currentTimeLogin,
                    lastLogged: formattedLastLogged
                },
                message: "Akses diberikan"
            };
        }

        if (!deviceIdFromDB) {
            await updateDeviceIdAndLastLogged(connection, tokenId, deviceId);
            await connection.commit();
            return {
                statusCode: 200,
                success: true,
                payload: {
                    client: clientFromDB,
                    currentTimeLogin: currentTimeLogin,
                    lastLogged: formattedLastLogged
                },
                message: "Perangkat baru terdeteksi & disimpan"
            };
        }

        await connection.rollback();
        errors.device = ["Token ini sudah terdaftar pada perangkat lain."];
        return {
            statusCode: 403,
            success: false,
            errors,
            message: "Perangkat tidak sesuai"
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error checking client info:", error);
        error.server = ["Terjadi kesalahan pada sistem. Silakan coba lagi nanti."]
        return {
            statusCode: 500,
            success: false,
            errors,
            message: "Terjadi kesalahan internal"
        };
    } finally {
        if (connection) connection.release();
    }
};

module.exports = checkClientInfo;
