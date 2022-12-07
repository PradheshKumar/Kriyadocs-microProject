const fs = require("fs");
function jobLinkPage(req, res) {
  const pageTemplate = fs
    .readFileSync("./htmlTemplate/jobsLink.html")
    .toString();
  const skills = fs
    .readFileSync("./skillsLink/" + req.url.split("=")[1] + ".txt") //name of Skill is extracted form the request URL
    .toString()
    .split("\n");
  let markup = pageTemplate.replace(
    "${REPLACE}",
    skills
      .map((el, i) => {
        if (el)
          return `<tr><td>${el.split(" at ")[0]}</td><td>${
            //Role
            el.split(" at ")[1]?.split("@")[0] //Company Name
          }</td><td>${
            el.split("@")[2] //Location
          }</td><td><a target="_blank" class="skillLinkButton" href="${
            el.split("@")[1] //Link
          }">Click Here</a></td></tr>`;
      })
      .join(" ")
  );
  markup = markup.replaceAll("${TITLE}", req.url.split("=")[1].toUpperCase()); //Name of the skill
  res.end(markup);
}

module.exports = { jobLinkPage };
