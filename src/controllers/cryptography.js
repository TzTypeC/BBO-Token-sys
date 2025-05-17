require('dotenv').config();
const crypto = require("crypto");

const key = Buffer.from(process.env.AES_KEY, 'hex');

const encrypt = (text) => {
    // console.log(text);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return { encrypted, iv: iv.toString("hex") };
};

const hash = (input) => {
    return crypto.createHash('sha256').update(input).digest('hex');
};

const decrypt = (encryptedToken, ivHex) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};

module.exports = { encrypt, decrypt, hash };
