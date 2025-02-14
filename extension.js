require("dotenv").config();
const vscode = require("vscode");
const { createAndPublishGitHubRepo } = require("./src/commands/createRepo");
const { startTracking } = require("./src/commands/startTracking");
const { stopTracking } = require("./src/commands/stopTracking");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Extension "github-productivity-tracker" is now active!');

  let createRepoCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.createGithubRepo",
    createAndPublishGitHubRepo
  );

  let startTrackingCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.startTracking",
    startTracking
  );

  let stopTrackingCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.stopTracking",
    stopTracking
  );

  context.subscriptions.push(createRepoCmd, startTrackingCmd, stopTrackingCmd);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
