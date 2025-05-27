const isTokenExpired = (expiredAt) => {
    const now = new Date();
    const expired = new Date(expiredAt);
    return now > expired;
};

module.exports = isTokenExpired;
