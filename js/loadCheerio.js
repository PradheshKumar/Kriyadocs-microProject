const request = require("request");
const cheerio = require("cheerio");
const got = require("got");

function loadCheerio(link, callBack) {
  got(link)
    .then((result) => {
      const $ = cheerio.load(result.body);
      callBack($);
    })
    .catch((err) => {
      console.log(err);
    });
  // request(link, function (error, response, body) {
  //   //body has the html code of the website

  // });
}
module.exports = { loadCheerio };
