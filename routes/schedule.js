const express = require("express");
const scheduleController = require("../controllers/schedule");

const router = express.Router();

router.post("/getSchedule", scheduleController.getSchedule);

module.exports = router;
