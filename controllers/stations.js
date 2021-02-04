const fetch = require("node-fetch");
const $ = require("cheerio");
const url =
  "https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en";

const Stations = require("../models/stations");
const Time = require("../models/time");

exports.getStations = async (req, res, next) => {
  const stationsAndTimesData = await getStationAndTimeData();
  res.json(stationsAndTimesData);
};

getStationAndTimeData = async () => {
  const stations = [];
  const times = [];
  try {
    const response = await fetch(url);
    const body = await response.text();
    $("#startStation", body)
      .find("option")
      .each((i, op) => {
        if ($(op).val().trim()) {
          stations.push(new Stations($(op).val().trim(), $(op).text().trim()));
        }
      });
    $("#startTime", body)
      .find("option")
      .each((i, op) => {
        if ($(op).val().trim()) {
          times.push(new Time($(op).val().trim(), $(op).text().trim()));
        }
      });
    console.log(times);
    return { stations: stations, times: times };
  } catch (error) {
    console.log(error);
  }
};
