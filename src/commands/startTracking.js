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
  const newFileName = `${FILE_NAME}-${new Date().toISOString()}`;

  // setInterval(async () => {
  try {
    // Run git diff in the current open directory
    execSync("git rev-parse --is-inside-work-tree", { cwd: workspacePath });
    let diff = execSync("git diff", { cwd: workspacePath }).toString();
    if (!diff.trim()) return; // Exit if no changes

    // Create the summary file in repoPath
    const summary = await summarizeDiff(diff);
    fs.writeFileSync(`${repoPath}/${newFileName}`, summary);

    // Perform git operations in repoPath
    await git.cwd(repoPath);
    await git.add([`${repoPath}/${newFileName}`]);
    await git.commit(`Update summary - ${new Date().toISOString()}`);
    await git.push("origin", "main");

    vscode.window.showInformationMessage("Code changes committed.");
  } catch (error) {
    vscode.window.showErrorMessage(
      "Error committing changes: " + error.message
    );
  }
  // }, 10000);
}

async function summarizeDiff(diff) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // const prompt = `You are a code assistant. Summarize the following git diff into a short, clear summary, highlighting key changes in code structure, logic, and functionality. Omit minor details. Here is the diff:\n${diff}`;
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "You are a code assistant. Summarize the following git diff into a short, clear summary, highlighting key changes in code structure, logic, and functionality. Omit minor details.",
          },
          { text: diff },
        ],
      },
    ],
  };
  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts
    ) {
      const summary = response.data.candidates[0].content.parts
        .map((part) => part.text)
        .join("");
      return summary;
    } else {
      throw new Error("No summary returned from Gemini API.");
    }
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return "Summary generation failed.";
  }
}

module.exports = { startTracking };
