const pool = require('../config/db'); // Gunakan pool MySQL

const storeToken = async (hashedToken, alias, iv, client, expiredDate) => {
    let connection;
    try {
        connection = await pool.getConnection();

        await connection.beginTransaction(); // ⬅️ mulai transaction

        const insertAccessTokensQuery = `
            INSERT INTO access_tokens (hashed_token, alias, iv, client) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await connection.execute(insertAccessTokensQuery, [hashedToken, alias, iv, client]);

        const tokenId = result.insertId;

        const insertClientInfoQuery = `
            INSERT INTO client_info (expired_at, client, token_id)
            VALUES (?, ?, ?)
        `
        await connection.execute(insertClientInfoQuery, [expiredDate, client, tokenId]);

        await connection.commit(); // ⬅️ commit kalau semua sukses

        return { success: true, message: "Token berhasil disimpan" };
    } catch (error) {
        console.error("Gagal menyimpan token:", error);
        return { success: false, message: "Error saat menyimpan token" };
    } finally {
        if (connection) connection.release();
    }
};

module.exports = storeToken;
