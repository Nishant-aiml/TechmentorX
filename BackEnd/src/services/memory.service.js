const fs = require('fs').promises;
const path = require('path');
const workspaceService = require('./workspace.service');

/**
 * Append entry to history.md in the workspace
 */
async function logAction(action, details = {}) {
    const workspace = workspaceService.getWorkspace();
    if (!workspace) return;

    const historyPath = path.join(workspace, 'history.md');
    const timestamp = new Date().toISOString();

    let entry = `\n## ${timestamp}\n`;
    entry += `**Action**: ${action}\n`;

    if (details.request) {
        entry += `**Request**: ${details.request}\n`;
    }
    if (details.filesModified && details.filesModified.length > 0) {
        entry += `**Files Modified**:\n`;
        details.filesModified.forEach(f => {
            entry += `- ${f}\n`;
        });
    }
    if (details.filesCreated && details.filesCreated.length > 0) {
        entry += `**Files Created**:\n`;
        details.filesCreated.forEach(f => {
            entry += `- ${f}\n`;
        });
    }
    if (details.summary) {
        entry += `**Summary**: ${details.summary}\n`;
    }
    entry += `---\n`;

    try {
        // Check if history.md exists
        let existingContent = '';
        try {
            existingContent = await fs.readFile(historyPath, 'utf-8');
        } catch (e) {
            // File doesn't exist, create with header
            existingContent = `# Project History\n\nThis file tracks all AI-assisted changes made to this project.\n\n---\n`;
        }

        await fs.writeFile(historyPath, existingContent + entry, 'utf-8');
        console.log(`[Memory] Logged action: ${action}`);
    } catch (error) {
        console.error(`[Memory] Error logging action:`, error.message);
    }
}

/**
 * Get history content
 */
async function getHistory() {
    const workspace = workspaceService.getWorkspace();
    if (!workspace) return null;

    const historyPath = path.join(workspace, 'history.md');

    try {
        return await fs.readFile(historyPath, 'utf-8');
    } catch (error) {
        return null;
    }
}

module.exports = {
    logAction,
    getHistory
};
