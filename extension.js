const vscode = require("vscode");
const fs = require("fs-extra");
const { simpleGit } = require("simple-git");
const { execSync } = require("child_process");
const ollama = require("ollama");
const path = require("path");
/**
 * @param {vscode.ExtensionContext} context
 */
const options = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

const REPO_NAME = "code-tracker";
const FILE_NAME = "progress-summary.txt";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
let repoPath = `${require("os").homedir()}/${REPO_NAME}`;
let git = simpleGit(options);

function activate(context) {
  console.log('Extension "github-productivity-tracker" is now active!');

  // Command to create GitHub repo
  let createRepoCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.createGithubRepo",
    async () => {
      try {
        await createAndPublishGitHubRepo(REPO_NAME);
      } catch (err) {
        vscode.window.showErrorMessage("Error: " + err.message);
      }
    }
  );

  // Command to start tracking
  let startTrackingCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.startTracking",
    async () => {
      vscode.window.showInformationMessage("Started Tracking Code Changes");
      startTracking();
    }
  );

  // Command to stop tracking
  let stopTrackingCmd = vscode.commands.registerCommand(
    "github-productivity-tracker.stopTracking",
    () => {
      vscode.window.showInformationMessage("Stopped Tracking Code Changes");
      // stopTracking();
    }
  );

  // Register all commands
  context.subscriptions.push(createRepoCmd, startTrackingCmd, stopTrackingCmd);
}

async function createAndPublishGitHubRepo(repoName) {
  try {
    const userName = execSync("gh api user -q .login").toString().trim();
    const repoUrl = `https://github.com/${userName}/${repoName}.git`;
    const repoPath = path.join(require("os").homedir(), repoName);

    vscode.window.showInformationMessage("Creating GitHub Repository...");
    // Check if GitHub CLI is authenticated
    execSync("gh auth status", { stdio: "ignore" });

    // Check if repo already exists
    const existingRepos = execSync("gh repo list --json name").toString();
    if (existingRepos.includes(repoName)) {
      console.log(`Repository '${repoName}' already exists.`);
      vscode.window.showInformationMessage(
        "Repository already exists. Pulling latest changes..."
      );

      // If local repo does not exist, clone it
      if (!fs.existsSync(repoPath)) {
        execSync(`git clone ${repoUrl} ${repoPath}`);
        console.log("Repository cloned successfully.");
      } else {
        // If local repo exists, pull latest changes
        process.chdir(repoPath);
        execSync("git pull origin main");
        console.log("Pulled latest changes.");
      }
      return;
    }

    // Create the repository on GitHub
    execSync(`gh repo create ${repoName} --private --confirm`);
    console.log(`GitHub repository '${repoName}' created.`);

    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath);
    }
    process.chdir(repoPath);

    // Initialize Git, add remote origin, create a README
    execSync("git init");
    vscode.window.showInformationMessage("Created Local Repo");
    execSync(
      `git remote add origin https://github.com/$(gh api user -q .login)/${repoName}.git`
    );
    fs.writeFileSync(
      "README.md",
      `# ${repoName}\n\nInitialized by Code Tracker`
    );

    execSync("git add README.md");
    execSync('git commit -m "Initial commit"');
    execSync("git branch -M main");
    execSync("git push -u origin main");
    console.log(`Repository '${repoName}' successfully pushed to GitHub.`);
    vscode.window.showInformationMessage("GitHub Repository Created!");
  } catch (error) {
    console.error("Error:", error.message);
    console.error(
      "Ensure GitHub CLI is installed and authenticated (`gh auth login`). Follow the instructions given on extension download page."
    );
    vscode.window.showErrorMessage("Error: " + error.message);
  }
}

async function setupLocalRepo() {
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath);
    git = simpleGit(repoPath);
    await git.init();
    await git.addRemote(
      "origin",
      `https://github.com/rahulpatil8020/${REPO_NAME}.git`
    );
    fs.writeFileSync(`${repoPath}/.gitignore`, "node_modules/\n.vscode/\n");
    await git.add([".gitignore"]);
    await git.commit("Initial commit");
    await git.push("origin", "main");
  }
}

async function startTracking() {
  setInterval(async () => {
    try {
      let diff = execSync("git diff").toString();
      if (!diff) return; // Skip if no changes

      let summary = "Summary:\n" + diff;
      //   await summarizeChanges(diff);
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

// async function summarizeChanges(diff) {
//   let response = await ollama.chat({
//     model: "mistral",
//     messages: [{ role: "user", content: `Summarize this code diff:\n${diff}` }],
//   });
//   return response.message.content;
// }

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
