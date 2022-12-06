const fs = require("fs");
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

module.exports = { skillRanking };
