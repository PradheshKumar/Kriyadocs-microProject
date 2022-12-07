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
const { Console } = require("console");
const fs = require("fs");

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
    new RegExp(`\\b(${skillsDict.join("|")})\\b`, "gi") //Skills are extracted from The Job Detail
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

module.exports = { skillsExtraction };
