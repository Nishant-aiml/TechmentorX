const express = require('express');
const router = express.Router();
const workspaceService = require('../services/workspace.service');
const ideAIService = require('../services/ide-ai.service');
const memoryService = require('../services/memory.service');

/**
 * POST /ide/workspace/open
 * Set the current workspace directory
 */
router.post('/workspace/open', async (req, res) => {
    try {
        const { path } = req.body;

        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        workspaceService.setWorkspace(path);
        const isEmpty = await workspaceService.isEmptyWorkspace(path);

        res.json({
            success: true,
            workspace: path,
            isNewProject: isEmpty
        });
    } catch (error) {
        console.error('[IDE] Workspace open error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ide/workspace/files
 * Get all files in the workspace
 */
router.get('/workspace/files', async (req, res) => {
    try {
        const workspace = workspaceService.getWorkspace();

        if (!workspace) {
            return res.status(400).json({ error: 'No workspace selected' });
        }

        const files = await workspaceService.getAllFiles(workspace);
        res.json({ files });
    } catch (error) {
        console.error('[IDE] Files list error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ide/file
 * Read a file from workspace
 */
router.get('/file', async (req, res) => {
    try {
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        const content = await workspaceService.readFile(path);
        res.json({ path, content });
    } catch (error) {
        console.error('[IDE] File read error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/file
 * Write a file to workspace
 */
router.post('/file', async (req, res) => {
    try {
        const { path, content } = req.body;

        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        await workspaceService.writeFile(path, content || '');
        res.json({ success: true, path });
    } catch (error) {
        console.error('[IDE] File write error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /ide/file
 * Delete a file from workspace
 */
router.delete('/file', async (req, res) => {
    try {
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        await workspaceService.deleteFile(path);
        res.json({ success: true, path });
    } catch (error) {
        console.error('[IDE] File delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/chat
 * Chat with AI about the codebase
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, includeCodebase = true } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const result = await ideAIService.chat(message, includeCodebase);
        res.json({ response: result });
    } catch (error) {
        console.error('[IDE] Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/generate
 * Generate a new project from description
 */
router.post('/generate', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const result = await ideAIService.generateProject(description);
        res.json(result);
    } catch (error) {
        console.error('[IDE] Generate error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/debug
 * Debug code and explain errors
 */
router.post('/debug', async (req, res) => {
    try {
        const { error: errorMessage, file } = req.body;

        if (!errorMessage) {
            return res.status(400).json({ error: 'Error message is required' });
        }

        const result = await ideAIService.debug(errorMessage, file);
        res.json(result);
    } catch (error) {
        console.error('[IDE] Debug error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/edit
 * Edit code based on instruction
 */
router.post('/edit', async (req, res) => {
    try {
        const { instruction, file } = req.body;

        if (!instruction) {
            return res.status(400).json({ error: 'Instruction is required' });
        }

        const result = await ideAIService.editCode(instruction, file);
        res.json(result);
    } catch (error) {
        console.error('[IDE] Edit error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ide/apply
 * Apply file changes to workspace
 */
router.post('/apply', async (req, res) => {
    try {
        const { files } = req.body;

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ error: 'Files array is required' });
        }

        const results = await ideAIService.applyChanges(files);
        res.json({ results });
    } catch (error) {
        console.error('[IDE] Apply error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ide/history
 * Get session history
 */
router.get('/history', async (req, res) => {
    try {
        const history = await memoryService.getHistory();
        res.json({ history: history || 'No history yet' });
    } catch (error) {
        console.error('[IDE] History error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
