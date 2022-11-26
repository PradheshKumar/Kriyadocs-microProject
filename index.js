const http = require('http');
const https = require('https');
const cheerio = require("cheerio")
const fs = require("fs")
 const request = require('request');
const hostname = '127.0.0.1';
const port = 3000;
let jobs;
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const puncRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()0-9]/g;
const scratchClass = ".col-md-12.col-lg-12.col-xs-12.padding-none.job-container.jobs-on-hover";

const server = http.createServer(async(req, res) => {
  res.statusCode = 200;
  fs.writeFileSync("books.txt","")
  request('https://www.freshersworld.com/jobs', function (error, response, body) {
     const $ = cheerio.load(body);
      $(scratchClass).each((i, el) => { if($(el).find("a").attr("href")) jobDescription($(el).find("a").attr("href"))})
});
  
  res.setHeader('Content-Type', 'text/plain');
  res.end("Hello")
});

server.listen(port, hostname, () => {
  console.log(`Server running at PORT ${port}`);
});

const jobDescription = (link) => {
  request(link, function (error, response, body) {
      const $ = cheerio.load(body);
      if($(".content_left.col-xs-12.about_comp").text().toString()!="")
        fs.appendFileSync("books.txt", $(".content_left.col-xs-12.about_comp").text().toString() + "\n")
});
}