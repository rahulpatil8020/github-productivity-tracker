const { execSync } = require("child_process");
const fs = require("fs-extra");
const vscode = require("vscode");
const { REPO_NAME, repoPath } = require("../utils/gitUtils");

async function createAndPublishGitHubRepo() {
  try {
    const userName = execSync("gh api user -q .login").toString().trim();
    const repoUrl = `https://github.com/${userName}/${REPO_NAME}.git`;

    // Check if GitHub CLI is authenticated
    execSync("gh auth status", { stdio: "ignore" });

    const remoteRepoExists = execSync(`gh repo list --json name`)
      .toString()
      .includes(REPO_NAME);

    if (remoteRepoExists) {
      console.log(`Repository '${REPO_NAME}' already exists.`);
      vscode.window.showInformationMessage(
        "Repository already exists. Pulling latest changes..."
      );

      if (!fs.existsSync(repoPath)) {
        execSync(`git clone ${repoUrl}`);
        console.log("Repository cloned successfully.");
      } else {
        process.chdir(repoPath);
        execSync("git pull origin main");
        console.log("Pulled latest changes.");
      }
    }

    vscode.window.showInformationMessage("Creating GitHub Repository...");
    execSync(`gh repo create ${REPO_NAME} --public`);
    console.log(`GitHub repository '${REPO_NAME}' created.`);
    vscode.window.showInformationMessage("GitHub Repository Created!");

    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath);
    }
    process.chdir(repoPath);

    // Initialize Git, add remote origin, create a README
    execSync("git init");
    vscode.window.showInformationMessage("Created Local Repo");
    execSync(
      `git remote add origin https://github.com/$(gh api user -q .login)/${REPO_NAME}.git`
    );
    fs.writeFileSync(
      "README.md",
      `# ${REPO_NAME}\n\nInitialized by Code Tracker`
    );

    execSync("git add README.md");
    execSync('git commit -m "Initial commit"');
    execSync("git branch -M main");
    execSync("git push -u origin main");
    console.log(`Repository '${REPO_NAME}' successfully pushed to GitHub.`);
    vscode.window.showInformationMessage("GitHub Repository Created!");
  } catch (error) {
    console.error(
      "Ensure GitHub CLI is installed and authenticated (`gh auth login`)."
    );
    vscode.window.showErrorMessage("Error: " + error.message);
  }
}

module.exports = { createAndPublishGitHubRepo };
