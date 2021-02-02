const express = require("express");
const stationController = require("../controllers/stations");

const router = express.Router();

router.get("/getStations", stationController.getStations);

module.exports = router;
