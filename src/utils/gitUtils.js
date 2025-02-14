const { simpleGit } = require("simple-git");
const os = require("os");

const options = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const REPO_NAME = "code-tracker";
const FILE_NAME = "progress-summary.md";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
let repoPath = `${os.homedir()}/${REPO_NAME}`;
let git = simpleGit(options);

module.exports = {
  git,
  REPO_NAME,
  FILE_NAME,
  CHECK_INTERVAL,
  repoPath,
};
