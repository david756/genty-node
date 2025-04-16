const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(502).json({ data: "Acceso no autorizado" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(505).json({ data: "expired token" });
        }
        req.body.user_id = decoded.userId;   
        next();
    });
};

module.exports = authMiddleware;
