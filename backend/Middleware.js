const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    console.log("inside middleware")
    console.log("Session ",req.session)
    console.log("Session token",req.session.token)
    const token = req.session?.token;
    if (!req.session || !req.session.token) {
        return res.status(403).json({ message: "Unauthorized, please login" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded._id;

        next(); 
    } catch (err) {
        return res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

module.exports = { authMiddleware };
