const pool = require('../config/db'); // Gunakan pool MySQL

const storeToken = async (hashedToken, alias, iv, client) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const query = `
            INSERT INTO token_info (hashed_token, alias, iv, client) 
            VALUES (?, ?, ?, ?)
        `;

        await connection.execute(query, [hashedToken, alias, iv, client]);

        return { success: true, message: "Token berhasil disimpan" };
    } catch (error) {
        console.error("Gagal menyimpan token:", error);
        return { success: false, message: "Error saat menyimpan token" };
    } finally {
        if (connection) connection.release();
    }
};

module.exports = storeToken;
