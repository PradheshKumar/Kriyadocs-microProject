const http = require("http");
const fs = require("fs");
const { loadCheerio } = require("./js/loadCheerio");
const hostname = "127.0.0.1";
const port = 3000;
const puncRegex = /[.,\/#!+$%\?^&\*;:{}=\-_`~()0-9]/g; //Punctuation Regular Expression
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
  "artificial intelligence",
  "machine learning",
  "data engineering",
  "AI/ML",
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

function reloadJobs(res) {
  deleteFiles(); //Delete Old Scrapped Files
  loadCheerio("https://www.freshersworld.com/jobs", ($) => {
    if (j == 0) j = $(scratchClass).length;
    $(scratchClass).each((i, el) => {
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
    let location = $(".job-title").text().split(" at ")[1];
    if (!location) {
      location = $(".job-location").text(); //Find Location of Job
    }
    if (location.trim() == "") location = "Unavailable";

    j--;
    if (j <= 0) {
      fs.writeFileSync(
        "jobs.txt",
        jobData.join(" ").replaceAll("\t", " ").replaceAll("\n", " ") + "\n"
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

function skillsExtraction(res) {
  let jobsText = fs.readFileSync("jobs.txt").toString(); //reads all texts from the jobs text file
  jobsText.split("+").forEach((el) => {
    addSKillLink(el.split("$")[0], el.split("$")[1]); //Adds Jobs Link that require the skills
  });
  countSkills();
  jobsText = jobsText
    .split("+")
    .map((el) => [...new Set(el.toLowerCase().split(" "))].join(" "))
    .join("+");

  let skills = [
    ...jobsText.match(new RegExp(`\\b(${skillsDict.join("|")})\\b`, "gi")), // Extracts the skills from text
  ];

  res.write("<script>window.location.href='/'</script>");
}
function countSkills() {
  fs.readdirSync("skillsLink").forEach((el) => {
    let skill = el.split(".txt")[0]; // Extracting Skill Name
    if (skill.length == 2) {
      skill = skill.toUpperCase();
    } else skill = skill[0].toUpperCase() + skill.slice(1); // converting First Letter to CAPS
    const count =
      fs
        .readFileSync("./skillsLink/" + el)
        .toString()
        .split("\n").length - 1;
    const skillJson = fs.existsSync("./skills.json")
      ? JSON.parse(fs.readFileSync("./skills.json"))
      : {};
    skillJson[skill] = count;
    fs.writeFileSync("./skills.json", JSON.stringify(skillJson));
  });
}
function addSKillLink(text, link) {
  const skills = text.match(
    new RegExp(`\\b(${skillsDict.join("|")})\\b`, "gi")
  );
  if (!skills) return;

  skills.forEach((el) => {
    let fileDir = "skillsLink/" + el.toLowerCase().split(" ").join("") + ".txt";
    if (
      //If Link Present Returns
      fs.existsSync(fileDir)
        ? fs.readFileSync(fileDir).toString().includes(link)
        : false
    )
      return;
    fs.appendFileSync(fileDir, link + "\n");
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
            }</td><td><a class="skillLinkButton" href="/skills=${el[0].toLowerCase()}">Click Here</a></td></tr>`;
        })
        .join(" ")
    )
    .replace("{ SkillsReplace }", fs.readFileSync("./skills.json"));

  res.end(markup);
}

function findDuplicateCount(array) {
  const count = {};
  array = array.map((el) => el[0].toUpperCase() + el.slice(1));

  array.forEach((el) => {
    if (count[el]) {
      count[el] += 1;
      return;
    }
    count[el] = 1;
  });
  return count;
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
function jobLinkPage(req, res) {
  const pageTemplate = fs
    .readFileSync("./htmlTemplate/jobsLink.html")
    .toString();
  const skills = fs
    .readFileSync(
      "./skillsLink/" + req.url.split("=")[1].split("%20").join("") + ".txt"
    )
    .toString()
    .split("\n");
  let markup = pageTemplate.replace(
    "${REPLACE}",
    skills
      .map((el, i) => {
        if (el)
          return `<tr><td>${el.split(" at ")[0]}</td><td>${
            el.split(" at ")[1]?.split("@")[0]
          }</td><td>${
            el.split("@")[2]
          }</td><td><a target="_blank" class="skillLinkButton" href="${
            el.split("@")[1]
          }">Click Here</a></td></tr>`;
      })
      .join(" ")
  );
  markup = markup.replaceAll(
    "${TITLE}",
    req.url.split("=")[1].split("%20").join(" ").toUpperCase()
  );
  // return `<tr><td>${i + 1}</td><td>${el[0]}</td><td>${
  //   el[1]
  // }</td><td><a class="skillLinkButton" href="/skills=${el[0].toLowerCase()}">Click Here</a></td></tr>`;
  res.end(markup);
}
