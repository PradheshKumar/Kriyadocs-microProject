const http = require("http");
const https = require("https");
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
const stopNoiseRegex = new RegExp(
  `\\b(${stopAndNoiseWords.join("|")})\\b`, //Regular Expression for StopWords and Noise Words
  "g"
);
const scratchClass =
  ".col-md-12.col-lg-12.col-xs-12.padding-none.job-container.jobs-on-hover"; //Class to be searched in the website to scrap

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  fs.writeFileSync("jobs.txt", ""); //Creating a new file or clearing Existing file
  request(
    "https://www.freshersworld.com/jobs", // Webisite being scraped -- https://www.freshersworld.com/jobs
    function (error, response, body) {
      const $ = cheerio.load(body);
      $(scratchClass).each((i, el) => {
        if ($(el).find("a").attr("href"))
          jobDescription($(el).find("a").attr("href")); //Calling Function that scraps the links present in current webpage
      });
    }
  );

  res.setHeader("Content-Type", "text/plain");
  res.end("Hello");
});

server.listen(port, hostname, () => {
  console.log(`Server running at PORT ${port}`);
});

const jobDescription = (link) => {
  request(link, function (error, response, body) {
    const $ = cheerio.load(body);
    let content = $(".content_left.col-xs-12.about_comp").text().toString(); //Details of the job scraped from the website
    if (content == "") return;

    content = content.replaceAll(puncRegex, "");
    content = content.replaceAll(stopNoiseRegex, ""); //Removes the punctuations,stop words and noise words
    fs.appendFileSync("jobs.txt", content + "\n"); //Modified Job Description added to the text file
  });
};
