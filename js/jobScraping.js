const fs = require("fs");
const { loadCheerio } = require("./loadCheerio");
const { skillsExtraction } = require("./skillExtraction");
const scrapClass =
  ".col-md-12.col-lg-12.col-xs-12.padding-none.job-container.jobs-on-hover"; //Class to be searched in the website to scrap
let totalLeft; //Total Number of Sites Yet to be scraped
const puncRegex = /[.,\/#!+$%\?^&\*;:{}=\-_`~()0-9]/g; // Regular Expression for Punctuations
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
]; // Array of Stop and Noise Words

const stopNoiseRegex = new RegExp(
  `\\b(${stopAndNoiseWords.join("|")})\\b`, //Regular Expression for StopWords and Noise Words
  "gi"
);
let jobData = []; //For storing Scraped Data
function reloadJobs(res) {
  deleteFiles(); //Delete Old Scrapped Files
  loadCheerio("https://www.freshersworld.com/jobs", ($) => {
    totalLeft = $(scrapClass).length;
    $(scrapClass).each((i, el) => {
      const link = $(el).find("a").attr("href");
      if (link) {
        jobDescription(link, res); //Calling Function that scraps the links present in the current webpage
      }
    });
  });
  res.write(
    //Initial response to client
    fs.readFileSync("./htmlTemplate/scrapingPage.html")
  );
}
function jobDescription(link, res) {
  loadCheerio(link, ($) => {
    let content = $(".content_left.col-xs-12.about_comp").text().toString(); //Details of the job scraped from the website
    if (content == "") content = $(".job-detail-section").text().toString();
    let role = $(".job-role").text(); //Getting Role for the job
    if (role == "") {
      role = $(".cname_mob").text() + " at " + $(".cname").find("h1").text();
    } else {
      role += "at" + $(".company-name").first().text(); //Adding Company Name
    }
    let location = $(".job-title").text().split(" at ")[1]; //Find Location of Job
    if (!location) {
      location = $(".job-location").text();
    }
    if (location.trim() == "") location = "Unavailable";

    totalLeft--;
    if (totalLeft <= 0) {
      fs.writeFileSync(
        "jobs.txt",
        jobData.join(" ").replaceAll("\t", " ").replaceAll("\n", " ")
      );
      skillsExtraction(res);

      return;
    }
    if (content == "") {
      return;
    }

    content = content.replaceAll(puncRegex, "");
    content = content.replaceAll(stopNoiseRegex, ""); //Removes the punctuations,stop words and noise words
    jobData.push(content + "$" + role + "@" + link + "@" + location + "+");
  });
}

function deleteFiles() {
  fs.readdir("skillsLink", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlinkSync("skillsLink/" + file);
    }
  }); //Deletes all Files in skillsLink Directory
  if (fs.existsSync("jobs.txt")) fs.unlinkSync("jobs.txt");
  if (fs.existsSync("skills.json")) fs.unlinkSync("skills.json");
}

module.exports = { reloadJobs };
