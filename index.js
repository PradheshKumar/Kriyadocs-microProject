const http = require("http");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
const hostname = "127.0.0.1";
const port = 3000;
const puncRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()0-9]/g; //Punctuation Regular Expression
const stopAndNoiseWords = [
  "a",
  "about",
  "after",
  "all",
  "also",
  "an",
  "another",
  "any",
  "are",
  "as",
  "and",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "between",
  "but",
  "both",
  "by",
  "came",
  "can",
  "come",
  "could",
  "did",
  "do",
  "each",
  "even",
  "for",
  "from",
  "further",
  "furthermore",
  "get",
  "got",
  "has",
  "had",
  "he",
  "have",
  "her",
  "here",
  "him",
  "himself",
  "his",
  "how",
  "hi",
  "however",
  "I",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "indeed",
  "just",
  "made",
  "many",
  "me",
  "might",
  "more",
  "moreover",
  "most",
  "much",
  "must",
  "my",
  "never",
  "not",
  "now",
  "of",
  "on",
  "only",
  "other",
  "our",
  "out",
  "or",
  "over",
  "said",
  "same",
  "see",
  "should",
  "since",
  "she",
  "some",
  "still",
  "such",
  "take",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "therefore",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "thus",
  "under",
  "up",
  "very",
  "was",
  "way",
  "we",
  "well",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "will",
  "with",
  "would",
  "you",
  "your",
]; // Array of Stop Words and Noise Words
let jobData = [],
  j = 0;
const skillsDict = [
  "Java",
  "ReactJS",
  "MySQL",
  "php",
  "MongoDB",
  "NPM",
  "Redux",
  "Angular",
  "webdevelopment",
  "Javascript",
  "backend",
  "linux",
  "problemsolving",
  "python",
  "nodejs",
  "cloud",
  "AI",
  "ML",
  "ArtificialIntelligence",
  "MachineLearning",
  "Deeplearning",
  "communication",
  "flutter",
  "css",
  "html",
  "js",
  "figma",
  "nosql",
  "coding",
]; //Dictionary of Skills
const stopNoiseRegex = new RegExp(
  `\\b(${stopAndNoiseWords.join("|")})\\b`, //Regular Expression for StopWords and Noise Words
  "gi"
);
const scratchClass =
  ".col-md-12.col-lg-12.col-xs-12.padding-none.job-container.jobs-on-hover"; //Class to be searched in the website to scrap

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  if (req.url.includes("?reload=true")) {
    reloadJobs(res); //Refresh Scrapped Details
  } else if (req.url == "/rankSkills") {
    //Ranking Skills Page Response
    skillRanking(res);
  } else if (req.url == "/") {
    //Home Page Response
    homePage(res);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at PORT ${port}`);
});

function reloadJobs(res) {
  fs.writeFileSync("jobs.txt", "Fetching...."); //Creating a new file or clearing Existing file
  request(
    "https://www.freshersworld.com/jobs", // Website being scraped -- https://www.freshersworld.com/jobs
    function (error, response, body) {
      const $ = cheerio.load(body); //body has the html code of the website
      if (j == 0) j = $(scratchClass).length;
      $(scratchClass).each((i, el) => {
        const link = $(el).find("a").attr("href");
        if (link) {
          jobDescription(link, res); //Calling Function that scraps the links present in the current webpage
        }
      });
    }
  );
  res.write(
    //Initial response to client
    fs.readFileSync("./htmlTemplate/scrapingPage.html")
  );
}
function jobDescription(link, res) {
  request(link, function (error, response, body) {
    const $ = cheerio.load(body);
    let content = $(".content_left.col-xs-12.about_comp").text().toString(); //Details of the job scraped from the website

    j--;
    if (j <= 0) {
      fs.writeFileSync("jobs.txt", jobData.join(" "));
      skillsExtraction(res);

      return;
    }
    if (content == "") {
      return;
    }

    content = content.replaceAll(puncRegex, "");
    content = content.replaceAll(stopNoiseRegex, ""); //Removes the punctuations,stop words and noise words
    jobData.push(content + "\n");
  });
}

function skillsExtraction(res) {
  const jobsText = fs.readFileSync("jobs.txt"); //reads all texts from the jobs text file
  let skills = [
    ...jobsText
      .toString()
      .match(new RegExp(`\\b(${skillsDict.join("|")})\\b`, "gi")), // Extracts the skills from text
  ];

  const skillsJSON = findDuplicateCount(skills);
  fs.writeFileSync("skills.json", JSON.stringify(skillsJSON)); //Writes the skills and their number of repetition in a new file in JSON format
  res.write("<script>window.location.href='/'</script>");
}
function homePage(res) {
  if (!fs.existsSync("./skills.json")) {
    reloadJobs(res);
    return;
  }
  const homePageTemp = fs
    .readFileSync("./htmlTemplate/homePage.html")
    .toString();
  const skills = Object.keys(JSON.parse(fs.readFileSync("./skills.json")));
  const markup = homePageTemp.replaceAll(
    "${REPLACE}",
    skills.map((el) => `<li>${el}</li>`).join("\n")
  );
  res.end(markup);
}

function skillRanking(res) {
  if (!fs.existsSync("./skills.json")) {
    reloadJobs(res);
    return;
  }
  const rankingTemp = fs
    .readFileSync("./htmlTemplate/skillsRanking.html")
    .toString();
  const skills = Object.entries(
    JSON.parse(fs.readFileSync("./skills.json"))
  ).sort(function (a, b) {
    return b[1] - a[1];
  });
  const markup = rankingTemp
    .replace(
      "${REPLACE}",
      skills
        .map((el, i) => {
          if (i < 10)
            return `<tr><td>${i + 1}</td><td>${el[0]}</td><td>${
              el[1]
            }</td></tr>`;
        })
        .join(" ")
    )
    .replace("{ SkillsReplace }", fs.readFileSync("./skills.json"));

  res.end(markup);
}

function findDuplicateCount(array) {
  const count = {};
  array = array
    .map((el) => el.toLowerCase()) //To find Duplicate with case sensitivity
    .map((el) => el[0].toUpperCase() + el.slice(1));

  array.forEach((el) => {
    if (count[el]) {
      count[el] += 1;
      return;
    }
    count[el] = 1;
  });
  return count;
}
