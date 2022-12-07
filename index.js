const http = require("http");
const fs = require("fs");
const { homePage } = require("./js/pageHandlers/homePage");
const { jobLinkPage } = require("./js/pageHandlers/jobLinkPage");
const { skillRanking } = require("./js/pageHandlers/skillsRankingPage");
const { reloadJobs } = require("./js/jobScraping");
const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  if (req.url.includes("?reload=true")) {
    reloadJobs(res); //Scrapping The Jobs
  } else if (req.url == "/rankSkills") {
    //Ranking Skills Page Response
    skillRanking(res);
  } else if (req.url == "/") {
    //Home Page Response
    homePage(res);
  } else if (req.url.includes("/skills=")) {
    //Home Page Response
    jobLinkPage(req, res);
  } else {
    res.end(fs.readFileSync("./htmlTemplate/404.html"));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at PORT ${port}`);
});
