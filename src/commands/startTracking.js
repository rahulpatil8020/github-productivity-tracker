const { execSync } = require("child_process");
const fs = require("fs-extra");
const vscode = require("vscode");
const {
  git,
  repoPath,
  FILE_NAME,
  CHECK_INTERVAL,
} = require("../utils/gitUtils");
const axios = require("axios");

async function startTracking() {
  const workspacePath = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : null;

  if (!workspacePath) {
    vscode.window.showErrorMessage("No workspace is opened.");
    return;
  }

  setInterval(async () => {
    try {
      // Run git diff in the current open directory
      execSync("git rev-parse --is-inside-work-tree", { cwd: workspacePath });
      let diff = execSync("git diff", { cwd: workspacePath }).toString();
      if (!diff.trim()) return; // Exit if no changes

      // Create the summary file in repoPath
      const summary = await summarizeDiff(diff);
      fs.writeFileSync(`${repoPath}/${FILE_NAME}`, summary);

      // Perform git operations in repoPath
      await git.cwd(repoPath);
      await git.add([`${repoPath}/${FILE_NAME}`]);
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

async function summarizeDiff(diff) {
  try {
    const response = await axios.post("http://3.21.158.116:8000/summarize", {
      diff,
    });
    const summary = response.data.summary;

    return summary;
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return "Summary generation failed.";
  }
}

module.exports = { startTracking };
