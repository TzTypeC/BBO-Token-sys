const pool = require('../config/db');

const checkTokenExists = async (hashedToken) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            "SELECT COUNT(*) as count FROM access_tokens WHERE hashed_token = ?",
            [hashedToken]
        );

        return rows[0].count > 0; // Jika count > 0, berarti token sudah ada
    } catch (error) {
        console.error("Error checking token existence:", error);
        return false; // Default return false jika ada error
    } finally {
        if (connection) connection.release();
    }
};

const checkTokenId = async (hashedToken) => {
    let connection;
    try {
        connection = await pool.getConnection();

    const [rows] = await connection.execute(
        "SELECT id FROM access_tokens WHERE hashed_token = ?",
        [hashedToken]
    );

    const id = rows.length > 0 ? rows[0].id : null;
    return id;
    } catch {
        console.error("Error checking token existence:", error);
        return false; // Default return false jika ada error
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { checkTokenExists, checkTokenId };
