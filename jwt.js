const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secret;

const AuthMiddleware = (req, res, next) => {
    // Check if the Authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Split the Authorization header and extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, key);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

const generateToken = (userData) => {
    // Add expiration to the token for security reasons
    return jwt.sign(userData, key, { expiresIn: 1000 });
};

module.exports = { AuthMiddleware, generateToken };
