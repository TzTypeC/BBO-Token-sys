const crypto = require('crypto');
const { checkTokenExists }= require('./checkToken');
const { hash } = require('../controllers/cryptography');

const generateToken = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token, hashedToken, isUnique = false;

    while (!isUnique) {
        token = Array.from({ length: 12 }, () =>
            chars.charAt(crypto.randomInt(0, chars.length))
        ).join("");

        hashedToken = hash(token);

        isUnique = !(await checkTokenExists(hashedToken)); // Panggil fungsi pengecekan
    }
    // console.log(token)

    return { token, hashedToken };
};

module.exports = generateToken;
