const express = require("express");
const bodyParser = require("body-parser");

const stationRoutes = require("./routes/stations");
const scheduleRoutes = require("./routes/schedule");

const app = express();

app.use(bodyParser.json());

app.use("/slrailway", stationRoutes);
app.use("/slrailway", scheduleRoutes);

//Production
app.listen(process.env.PORT || 3000);

//Development
// app.listen(3000);
