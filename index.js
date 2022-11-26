const http = require("http");
const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
const { url } = require("inspector");
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
  i = 1,
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
  if (req.url == "/") {
    // Home Page Url
    homePage(req, res);
  } else if (req.url == "/skills") {
    //skills Page Url
    skillsExtraction(req, res);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at PORT ${port}`);
});

const homePage = (req, res) => {
  fs.writeFileSync("jobs.txt", "Fetching...."); //Creating a new file or clearing Existing file
  request(
    "https://www.freshersworld.com/jobs", // Website being scraped -- https://www.freshersworld.com/jobs
    function (error, response, body) {
      const $ = cheerio.load(body); //body has the html code of the website
      if (j == 0) j = $(scratchClass).length;
      $(scratchClass).each((i, el) => {
        if ($(el).find("a").attr("href")) {
          jobDescription($(el).find("a").attr("href"), res); //Calling Function that scraps the links present in the current webpage
        }
      });
    }
  );
  res.write(
    //Initial response to client
    "<div class='a'><h1>Data is being Scraped , Please Wait...</h1></div>"
  );
};
const jobDescription = (link, res) => {
  request(link, function (error, response, body) {
    const $ = cheerio.load(body);
    let content = $(".content_left.col-xs-12.about_comp").text().toString(); //Details of the job scraped from the website
    if (content == "") {
      j--;
      if (j < i) {
        fs.writeFileSync("jobs.txt", jobData.join(" "));
        res.end(
          "<script>document.children[0].children[1].innerHTML='<h1><a href=/skills>Check Skills</a></h1>';</script>"
        ); //Modified Job Description added to the text file
        return;
      } else return;
    }
    i++;
    content = content.replaceAll(puncRegex, "");
    content = content.replaceAll(stopNoiseRegex, ""); //Removes the punctuations,stop words and noise words
    jobData.push(content + "\n");
  });
};

const skillsExtraction = (req, res) => {
  res.end("<a href='/'>Home Page</a> ");
  const jobsText = fs.readFileSync("jobs.txt"); //reads all texts from the jobs text file
  let skills = [
    ...jobsText
      .toString()
      .match(new RegExp(`\\b(${skillsDict.join("|")})\\b`, "gi")), // Extracts the skills from text
  ];
  console.log(skills);
  fs.writeFileSync("skills.txt", skills.join(" ").toLowerCase()); //Writes the skills in a new file
};
