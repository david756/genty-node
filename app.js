const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const userRoutes = require("./src/routes/user.routes");
const activityRoutes = require("./src/routes/activity.routes");
const chatRoutes = require("./src/routes/chat.routes");
const settingRoutes = require("./src/routes/setting.routes");

const router = express.Router();

router.use("/user", userRoutes);
router.use("/activity", activityRoutes);
router.use("/chat", chatRoutes);
router.use("/setting", settingRoutes);



app.use("/api", router);

app.get("/", (req, res) => {
    res.send("¡Servidor funcionando correctamente!");
});

module.exports = app;
