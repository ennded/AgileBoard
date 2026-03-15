const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret123";

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

module.exports = getUserFromToken;
