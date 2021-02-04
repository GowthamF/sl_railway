const fetch = require("node-fetch");
const FormData = require("form-data");
const $ = require("cheerio");
const Schedule = require("../models/schedule");

const url =
  "https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en";

exports.getSchedule = async (req, res, next) => {
  await getScheduleData(req);
  res.json({});
};

getScheduleData = async (req) => {
  try {
    const scheduleHeaders = [];
    let scheduleBody = [];
    let timings = [];
    const arrivalTimings = [];
    const depatureTimings = [];
    const trainDetails = [];
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
    const searchDate = "15/01/2021";

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
    // $(".row .col-md-12 .table-responsive", body)
    //   .find("table > thead > tr > th")
    //   .each((i, th) => {
    //     scheduleHeaders.push({ Header: $(th).text().trim() });
    //   });

    // $(".row .col-md-12 .table-responsive", body)
    //   .find("table > tbody > tr > td")
    //   .each((i, td) => {
    //     const td1 = $(td).find("font");
    //     // console.log(td1);
    //     if (td1.length === 0) {
    //       const value = $(td).text().trim().split(" ");
    //       console.log(value);
    //     } else {
    //       if ($("font", td).attr("color") === "green") {
    //         const arrivalTime = $("font", td).text().trim();
    //         if (arrivalTime) {
    //           arrivalTimings.push(arrivalTime);
    //         }
    //       } else if ($("font", td).attr("color") === "red") {
    //         const depatureTime = $("font", td).text().trim();
    //         if (depatureTime) {
    //           depatureTimings.push(depatureTime);
    //         }
    //       }
    //     }
    //   });

    const tableContent = $(".row .col-md-12 .table-responsive", body).find(
      "table"
    );

    tableContent.find("thead > tr > th").each((index, th) => {
      scheduleHeaders.push({ Header: $(th).text().trim(), Index: index });
    });

    tableContent.find("tbody > tr").each((index, tr) => {
      if ($(tr).attr("style")) {
        return;
      } else {
        $(tr)
          .find("td")
          .each((index, td) => {
            const tdData = $(td).find("font");

            if (tdData.length === 0) {
              console.log($(td).text());
              //   trainDetails.push()
            } else {
              if ($("font", td).attr("color") === "green") {
                const arrivalTime = $("font", td).text().trim();
                if (arrivalTime) {
                  // arrivalTimings.push(arrivalTime);
                }
              } else if ($("font", td).attr("color") === "red") {
                const depatureTime = $("font", td).text().trim();
                if (depatureTime) {
                  // depatureTimings.push(depatureTime);
                }
              }
            }
          });
      }
    });

    arrivalTimings.forEach((arrivalTime, ind) => {
      const depatureTime = depatureTimings[ind];
      timings.push({ arrivalTime: arrivalTime, depatureTime: depatureTime });
    });
    // scheduleBody = [{ timings: { ...timings } }];
    // console.log(timings);
  } catch (error) {
    console.log(error);
  }
};

getHeaders = async () => {};
