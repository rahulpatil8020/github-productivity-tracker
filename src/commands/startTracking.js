const { execSync } = require("child_process");
const fs = require("fs-extra");
const vscode = require("vscode");
const {
  git,
  repoPath,
  FILE_NAME,
  CHECK_INTERVAL,
} = require("../utils/gitUtils");

async function startTracking() {
  setInterval(async () => {
    try {
      let diff = execSync("git diff").toString();
      if (!diff) return;
      let summary = "Summary:\n" + diff;
      fs.writeFileSync(`${repoPath}/${FILE_NAME}`, summary);
      await git.add([FILE_NAME]);
      await git.commit(`Update summary - ${new Date().toISOString()}`);
      await git.push("origin", "main");
      vscode.window.showInformationMessage("Code changes committed.");
    } catch (error) {
      vscode.window.showErrorMessage(
        "Error committing changes: " + error.message
      );
    }
  }, CHECK_INTERVAL);
}

module.exports = { startTracking };
