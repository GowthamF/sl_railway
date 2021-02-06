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
    let scheduleBody = [];
    let trainDetails = [];
    const scheduleAdditionalData = [];
    const ticketDetails = { totalDistance: {}, ticketPrices: [] };

    const selectedLocale = req.body.selectedLocale;
    const startStationID = req.body.startStationID;
    const endStationID = req.body.endStationID;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const searchDate = req.body.searchDate;

    // const selectedLocale = "en";
    // const startStationID = 61;
    // const endStationID = 115;
    // const startTime = -1;
    // const endTime = -1;
    // const searchDate = "04/02/2021";

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
    const errorText = $("#es-content", body)
      .find("legend > strong")
      .text()
      .trim();
    if (errorText === "Error") {
      const err = new Error("System error occurred.");
      throw err;
    }
    const totalAvailableTrains = $(".row .col-md-12", body)
      .find("div > strong")
      .text()
      .trim();
    const directTrains = $(".row .col-md-12", body)
      .find("div > h4")
      .text()
      .trim();

    $(".hero-unit", body)
      .find("table > tbody > tr")
      .each((index, tr) => {
        if ($("td > strong", tr).length > 0) {
          ticketDetails.totalDistance = $("td", tr).text().trim();
          return;
        } else {
          ticketDetails.ticketPrices.push(
            $("td", tr).text().trim().replace("Class", "Class ")
          );
          return;
        }
      });
    const tableContent = $(".row .col-md-12 .table-responsive", body).find(
      "table"
    );

    tableContent.find("thead > tr > th").each((index, th) => {
      scheduleHeaders.push($(th).text().trim());
    });

    tableContent.find("tbody > tr").each((index, tr) => {
      if ($(tr).find("td > hr").length > 0 || $(tr).attr("style")) {
        if ($(tr).attr("style")) {
          const additionalData = $(tr)
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
          const startTEIndex = additionalData.findIndex((val) => {
            return val === "Train";
          });
          const endTEIndex = additionalData.findIndex((val) => {
            return val === "No:";
          });

          const available = additionalData.slice(startAIndex, endAIndex);
          const trainEnd = additionalData.slice(startTEIndex, endTEIndex - 1);

          const availableClasses = available
            .join("")
            .split(":")[1]
            .replace(/,/g, " | ");
          const trainsEndData = trainEnd.join(" ").split("at");
          const trainsEndAt =
            trainsEndData[1].trim() + " at " + trainsEndData[2].trim();

          const trainNoData = additionalData.slice(
            endTEIndex + 1,
            endTEIndex + 2
          );

          const trainNo = trainNoData[0];
          scheduleAdditionalData.push({
            availableClasses: availableClasses,
            trainsEndAt: trainsEndAt,
            trainNo: trainNo,
          });
        }

        return;
      } else {
        const schedule = new Schedule();

        $(tr)
          .find("td")
          .each((index, td) => {
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
                const destination = $(td).text().split(" ");

                schedule.destination = {
                  destinationStation: destination
                    .slice(0, destination.length - 1)
                    .toLocaleString()
                    .trim()
                    .replace(/,/g, " "),
                  destinationStationTime: destination[
                    destination.length - 1
                  ].trim(),
                };
                break;
              case 4:
                const endStation = $(td).text().split(" ");
                schedule.endStation = {
                  endStation: endStation
                    .slice(0, endStation.length - 1)
                    .toLocaleString()
                    .trim()
                    .replace(/,/g, " "),
                  endStationTime: endStation[endStation.length - 1].trim(),
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
              case 8:
                console.log($(td).parent("tr").attr("style"));
                break;
              default:
                break;
            }
          });

        scheduleBody.push(schedule);
      }
    });

    const schedule = scheduleAdditionalData.map((val, index) => {
      const _scheduleData = scheduleBody[index];
      _scheduleData.availableClasses = val.availableClasses;
      _scheduleData.trainsEndAt = val.trainsEndAt;
      _scheduleData.trainNo = val.trainNo;

      return _scheduleData;
    });
    trainDetails = {
      headerText: headerText,
      totalAvailableTrains: totalAvailableTrains,
      directTrains: directTrains,
      headers: scheduleHeaders,
      ticketDetails: ticketDetails,
      schedules: schedule,
    };
    return trainDetails;
  } catch (error) {
    console.log(error);
  }
};

getHeaders = async () => {};
