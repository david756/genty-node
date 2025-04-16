const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware'); 

const users = require("../controllers/user.controller");

router.post("/send-otp", users.sendOTP);
router.post("/verify-otp", users.verifyOTP);
router.post("/refresh_access_token", users.refreshAccessToken);
router.post("/register-data",authMiddleware, users.registerDataUser);
router.post("/save-user-location",authMiddleware, users.saveUserLocation);

module.exports = router;
