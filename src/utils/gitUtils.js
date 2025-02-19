const { simpleGit } = require("simple-git");
const os = require("os");

const options = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const getFormattedDate = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date();

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const daySuffix = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${month} ${day}${daySuffix(day)} ${year}.md`;
};

const REPO_NAME = "code-tracker";
const FILE_NAME = getFormattedDate();
const CHECK_INTERVAL = 60 * 60 * 1000; // 30 minutes
let repoPath = `${os.homedir()}/${REPO_NAME}`;
let git = simpleGit(options);

module.exports = {
  git,
  REPO_NAME,
  FILE_NAME,
  CHECK_INTERVAL,
  repoPath,
};
