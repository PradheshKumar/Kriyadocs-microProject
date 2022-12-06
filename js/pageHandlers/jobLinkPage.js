const fs = require("fs");
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
  res.end(markup);
}

module.exports = { jobLinkPage };
