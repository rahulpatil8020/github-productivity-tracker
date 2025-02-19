# **Code Tracker - VS Code Extension**

🚀 **Automatically track your coding activity and commit progress summaries to GitHub.**

## **Overview**

Code Tracker is a VS Code extension that monitors your coding activity and automatically commits summarized changes to a GitHub repository every 30 minutes. The extension uses Google's Gemini AI to generate commit summaries based on `git diff`, ensuring concise and meaningful documentation of your progress.

## **Features**

✅ **Automatic Commit Tracking** – Captures your code changes every 30 minutes.  
✅ **AI-Powered Summaries** – Uses Google's Gemini API to summarize changes.  
✅ **GitHub Integration** – Automatically creates a `code-tracker` repository if it doesn’t exist.  
✅ **Secure Communication** – Data is sent over **HTTPS** using an AWS-hosted Node.js server.  
✅ **Minimal Setup** – Works seamlessly without manual intervention.

## **Installation**

### **1. Install from VS Code Marketplace**

(Once published, provide a link here)

### **2. Manual Installation**

1. Download the `.vsix` package (if available).
2. In VS Code, go to `Extensions` → Click `⋮` → `Install from VSIX...`.
3. Select the downloaded file and install.

## **How It Works**

1. The extension **monitors file changes** in your workspace.
2. Every **30 minutes**, it:
   - Runs `git diff` to detect changes.
   - Sends the diff to **Google Gemini API** for summarization.
   - Commits and pushes the summary to a **private GitHub repository** called `code-tracker`.
3. The filename format for logs follows: Month Day Year.md (e.g., Feb 14th 2025.md)

## **Configuration**

### **1. Set Up Your GitHub Token**

To authenticate GitHub API requests, store your **GitHub Personal Access Token** in VS Code settings:

1. Open **Settings** (`Ctrl + ,`).
2. Search for `"codeTracker.githubToken"` and enter your token.

### **2. API Key for Summarization**

1. Go to **Google Cloud Console** → Get an API key for **Gemini AI**.
2. Store it in VS Code settings under `"codeTracker.geminiApiKey"`.

## **Backend Server (AWS Deployment)**

Your extension communicates with a **Node.js server hosted on AWS**, secured via **HTTPS** using AWS ACM & Elastic Load Balancer.

### **Deploying Your Own Server (Optional)**

If you want to self-host:

1. Clone the backend repository.
2. Deploy it on **AWS EC2**.
3. Secure it using **AWS ACM & ELB** (HTTPS).
4. Update the server endpoint in the extension settings.

## **Security**

✅ **Uses HTTPS** to prevent data interception.  
✅ **Stores API keys securely** in VS Code settings.  
✅ **GitHub repository is private** by default.

## **Contributing**

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a new branch (`feature-branch`).
3. Commit your changes.
4. Submit a pull request.

## **License**
