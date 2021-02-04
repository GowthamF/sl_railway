const express = require("express");
const stationRoutes = require("./routes/stations");

const app = express();

// const potusParse = (url) => {
//   return rp(url)
//     .then(function (html) {
//       return {
//         name: $(".firstHeading", html).text(),
//         birthday: $(".bday", html).text(),
//       };
//     })
//     .catch(function (err) {
//       //handle error
//     });
// };

// app.use((req, res, next) => {
//   //   rp(url)
//   //     .then(function (html) {
//   //       //success!
//   //       const wikiUrls = [];
//   //       const tt = $(".wikitable b > a", html)[0].attribs.href;
//   //       console.log(tt);
//   //       for (let i = 0; i < 45; i++) {
//   //         wikiUrls.push($(".wikitable b > a", html)[i].attribs.href);
//   //       }
//   //       return Promise.all(
//   //         wikiUrls.map(function (url) {
//   //           return potusParse("https://en.wikipedia.org" + url);
//   //         })
//   //       );
//   //     })
//   //     .then(function (presidents) {
//   //       console.log(presidents);
//   //       res.json(presidents);
//   //     })
//   //     .catch(function (err) {
//   //       //handle error
//   //       console.log(err);
//   //     });
// });

app.use(stationRoutes);

app.listen(3000);
