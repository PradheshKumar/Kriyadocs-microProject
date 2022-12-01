const request = require("request");
const cheerio = require("cheerio");
function loadCheerio(link, callBack) {
  request(link, function (error, response, body) {
    //body has the html code of the website
    const $ = cheerio.load(body);

    callBack($);
  });
}
module.exports = { loadCheerio };
