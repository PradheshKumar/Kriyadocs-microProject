const fs = require("fs");
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

module.exports = { homePage };
