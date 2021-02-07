const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const stationRoutes = require("./routes/stations");
const scheduleRoutes = require("./routes/schedule");

const app = express();

app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/slrailway", stationRoutes);
app.use("/slrailway", scheduleRoutes);

//Production
// app.listen(process.env.PORT || 3000);

//Development
app.listen(3000);
