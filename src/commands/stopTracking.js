const vscode = require("vscode");

async function stopTracking() {
  try {
    // Clear any existing timers or intervals used for tracking
    if (global.trackingInterval) {
      clearInterval(global.trackingInterval);
      global.trackingInterval = null;
    }

    vscode.window.showInformationMessage("Code tracking stopped.");
  } catch (error) {
    vscode.window.showErrorMessage("Error stopping tracking: " + error.message);
  }
}

module.exports = { stopTracking };
