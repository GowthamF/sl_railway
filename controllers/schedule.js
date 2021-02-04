const fetch = require("node-fetch");
const FormData = require("form-data");
const $ = require("cheerio");
const Schedule = require("../models/schedule");

const url =
  "https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en";

exports.getSchedule = async (req, res, next) => {
  const trainDetails = await getScheduleData(req);
  res.json(trainDetails);
};

getScheduleData = async (req) => {
  try {
    const scheduleHeaders = [];
    const scheduleBody = [];
    let trainDetails = [];
    // const selectedLocale = req.body.selectedLocale;
    // const startStationID = req.body.startStationID;
    // const endStationID = req.body.endStationID;
    // const startTime = req.body.startTime;
    // const endTime = req.body.endTime;
    // const searchDate = req.body.searchDate;

    const selectedLocale = "en";
    const startStationID = 61;
    const endStationID = 115;
    const startTime = -1;
    const endTime = -1;
    const searchDate = "04/02/2021";

    const formData = new FormData();
    formData.append("selectedLocale", selectedLocale);
    formData.append("searchCriteria.startStationID", startStationID);
    formData.append("searchCriteria.endStationID", endStationID);
    formData.append("searchCriteria.startTime", startTime);
    formData.append("searchCriteria.endTime", endTime);
    formData.append("searchDate", searchDate);

    const response = await fetch(url, { method: "POST", body: formData });
    const body = await response.text();

    const headerText = $("#es-content", body)
      .find("legend > span")
      .text()
      .trim();
    const totalAvailableTrains = $(".row .col-md-12", body)
      .find("div > strong")
      .text()
      .trim();
    const directTrains = $(".row .col-md-12", body)
      .find("div > h4")
      .text()
      .trim();

    const tableContent = $(".row .col-md-12 .table-responsive", body).find(
      "table"
    );

    tableContent.find("thead > tr > th").each((index, th) => {
      scheduleHeaders.push($(th).text().trim());
    });

    tableContent.find("tbody > tr").each((index, tr) => {
      if ($(tr).find("td > hr").length > 0) {
        return;
      } else {
        const schedule = new Schedule();

        $(tr)
          .find("td")
          .each((index, td) => {
            if ($(td).parent("tr").attr("style")) {
              schedule.availableClasses = $(td).parent("tr").text().trim();
              const additionalData = $(td)
                .parent("tr")
                .text()
                .trim()
                .replace(/\s\s+/g, " ")
                .split(" ");

              const startAIndex = additionalData.findIndex((val) => {
                return val === "Available";
              });
              const endAIndex = additionalData.findIndex((val) => {
                return val === "Train";
              });
              const available = additionalData.slice(startAIndex, endAIndex);
              const modifyingAvailable = available.toString().split(":");
              const uppdatedAvailable = modifyingAvailable[1].replace(
                /,/g,
                "|"
              );
              // schedule.availableClasses = .toString()
              // .replace(/,/g, " ");
              console.log(uppdatedAvailable);
            } else {
              switch (index) {
                case 0:
                  schedule.startStation = $(td).text().trim();
                  break;
                case 1:
                case 2:
                  if ($("font", td).attr("color") === "green") {
                    const arrivalTime = $("font", td).text().trim();
                    if (arrivalTime) {
                      schedule.arrivalTime = arrivalTime;
                      break;
                    }
                  } else if ($("font", td).attr("color") === "red") {
                    const depatureTime = $("font", td).text().trim();
                    if (depatureTime) {
                      schedule.depatureTime = depatureTime;
                      break;
                    }
                  }
                  break;
                case 3:
                  schedule.destination = {
                    destinationStation: $(td).text().split(" ")[0].trim(),
                    destinationStationTime: $(td).text().split(" ")[1].trim(),
                  };
                  break;
                case 4:
                  schedule.endStation = {
                    endStation: $(td).text().split(" ")[0].trim(),
                    endStationTime: $(td).text().split(" ")[1].trim(),
                  };
                  break;
                case 5:
                  schedule.frequency = $(td).text().trim();
                  break;
                case 6:
                  schedule.name = $(td).text().trim();
                  break;
                case 7:
                  schedule.type = $(td).text().trim();
                  break;
                default:
                  break;
              }
            }
          });

        scheduleBody.push(schedule);
      }
    });
    trainDetails = { headers: scheduleHeaders, schedules: scheduleBody };
    return trainDetails;
  } catch (error) {
    console.log(error);
  }
};

getHeaders = async () => {};
