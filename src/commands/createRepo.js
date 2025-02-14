const { execSync } = require("child_process");
const fs = require("fs-extra");
const vscode = require("vscode");
const { REPO_NAME, repoPath } = require("../utils/gitUtils");

async function createAndPublishGitHubRepo() {
  try {
    const userName = execSync("gh api user -q .login").toString().trim();
    const repoUrl = `https://github.com/${userName}/${REPO_NAME}.git`;

    // Check if GitHub CLI is authenticated
    try {
      execSync("gh auth status", { stdio: "ignore" });
    } catch (err) {
      vscode.window.showErrorMessage(
        "GitHub CLI is not authenticated. Run `gh auth login`."
      );
      return;
    }

    let remoteRepoExists = false;
    try {
      const existingRepos = execSync(`gh repo list --json name`).toString();
      remoteRepoExists = existingRepos.includes(REPO_NAME);
    } catch (err) {
      vscode.window.showWarningMessage(
        "Failed to fetch repository list. Assuming no remote repo."
      );
    }

    if (remoteRepoExists) {
      vscode.window.showInformationMessage(
        "Repository already exists. Syncing with remote..."
      );
      if (!fs.existsSync(repoPath)) {
        try {
          execSync(`git clone ${repoUrl} ${repoPath}`);
          vscode.window.showInformationMessage(
            "Repository cloned successfully."
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            "Failed to clone repository: " + err.message
          );
          return;
        }
      } else {
        try {
          process.chdir(repoPath);
          execSync("git pull origin main");
          vscode.window.showInformationMessage("Pulled latest changes.");
        } catch (err) {
          vscode.window.showErrorMessage(
            "Failed to pull latest changes: " + err.message
          );
          return;
        }
      }
    } else {
      // Handle case where local repo exists but remote doesn't
      if (fs.existsSync(repoPath)) {
        vscode.window.showInformationMessage(
          "Local repo exists but remote repo does not. Creating remote..."
        );
        try {
          execSync(`gh repo create ${REPO_NAME} --public`);
          vscode.window.showInformationMessage("GitHub repository created.");

          process.chdir(repoPath);

          // Check if .git already exists
          if (!fs.existsSync(`${repoPath}/.git`)) {
            execSync("git init");
          }

          // Check if remote already exists
          try {
            execSync("git remote show origin", { stdio: "ignore" });
          } catch {
            execSync(`git remote add origin ${repoUrl}`);
          }

          execSync("git add .");

          // Check if there are any staged changes to commit
          const status = execSync("git status --porcelain").toString();
          if (status.trim() !== "") {
            execSync('git commit -m "Initial commit"');
          }

          execSync("git branch -M main");
          execSync("git push -u origin main");
          vscode.window.showInformationMessage(
            "Local repo successfully pushed to GitHub."
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            "Failed to create and push to remote repo: " + err.message
          );
        }
      } else {
        vscode.window.showInformationMessage(
          "Creating new GitHub repository..."
        );
        try {
          execSync(`gh repo create ${REPO_NAME} --public`);
          vscode.window.showInformationMessage("GitHub repository created.");

          fs.mkdirSync(repoPath, { recursive: true });
          process.chdir(repoPath);
          execSync("git init");
          execSync(`git remote add origin ${repoUrl}`);
          fs.writeFileSync(
            "README.md",
            `# ${REPO_NAME}\n\nInitialized by Code Tracker`
          );
          execSync("git add README.md");
          execSync('git commit -m "Initial commit"');
          execSync("git branch -M main");
          execSync("git push -u origin main");
          vscode.window.showInformationMessage(
            "New repository initialized and pushed to GitHub."
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            "Error during repo creation: " + err.message
          );
        }
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage("Unexpected error: " + error.message);
  }
}

module.exports = { createAndPublishGitHubRepo };
