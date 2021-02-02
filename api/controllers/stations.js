const rp = require("request-promise");
const $ = require("cheerio");
const Stations = require("../models/stations");
const Time = require("../models/time");
const url =
  "https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en";

exports.getStations = async (req, res, next) => {
  const stationsAndTimesData = await getStationAndTimeData();
  res.json(stationsAndTimesData);
};

const getStationAndTimeData = async () => {
  const stations = [];
  const times = [];
  return rp(url).then(async (html) => {
    $("#startStation", html)
      .find("option")
      .each((i, op) => {
        if ($(op).val()) {
          stations.push(new Stations($(op).val(), $(op).text()));
        }
      });
    $("#startTime", html)
      .find("option")
      .each((i, op) => {
        if ($(op).val()) {
          times.push(new Time($(op).val(), $(op).text()));
        }
      });

    return { stations: stations, times: times };
  });
};
