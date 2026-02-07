require('dotenv').config();
const OpenAI = require("openai");
const workspaceService = require('./workspace.service');
const memoryService = require('./memory.service');

// OpenAI Setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5-nano";

/**
 * System prompt for IDE AI - Cursor-like behavior
 */
function getIDESystemPrompt() {
    return `You are an expert AI coding assistant integrated into an IDE. You have access to the user's entire codebase and can help with:

1. **Project Generation**: Create new projects from scratch based on user descriptions
2. **Code Explanation**: Explain how code works, file by file or function by function
3. **Debugging**: Identify bugs, explain errors, and propose fixes
4. **Code Editing**: Modify existing code safely with targeted changes
5. **Optimization**: Suggest performance improvements and refactoring
6. **Documentation**: Generate docs, comments, and README files

IMPORTANT RULES:
- You have FULL ACCESS to all files in the workspace - do NOT ask users to paste code
- When editing code, return ONLY the modified sections, not entire files
- Always explain your reasoning before making changes
- For file operations, use the exact format specified below

When you need to CREATE or MODIFY files, respond with this format:
\`\`\`file:path/to/file.ext
file content here
\`\`\`

When you need to EXPLAIN something, use markdown formatting.

Be concise, accurate, and helpful. Act like an expert pair programmer.`;
}

/**
 * Build context from codebase for AI
 */
async function buildCodebaseContext() {
    try {
        const files = await workspaceService.getCodebaseContext(30);
        if (files.length === 0) {
            return "This is an empty workspace with no files yet.";
        }

        let context = "## Current Codebase:\n\n";
        for (const file of files) {
            context += `### ${file.path}\n\`\`\`\n${file.content.slice(0, 3000)}\n\`\`\`\n\n`;
        }
        return context;
    } catch (error) {
        return "Could not read codebase.";
    }
}

/**
 * Chat with AI about the codebase
 */
async function chat(userMessage, includeCodebase = true) {
    console.log(`[IDE AI] Chat request: ${userMessage.slice(0, 100)}...`);

    let contextMessage = "";
    if (includeCodebase) {
        contextMessage = await buildCodebaseContext();
    }

    const messages = [
        { role: "system", content: getIDESystemPrompt() },
    ];

    if (contextMessage) {
        messages.push({ role: "user", content: `Here is the current codebase for context:\n\n${contextMessage}` });
        messages.push({ role: "assistant", content: "I've analyzed the codebase. How can I help you?" });
    }

    messages.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 8192
    });

    const response = completion.choices[0].message.content;

    // Log to history
    await memoryService.logAction('AI Chat', {
        request: userMessage.slice(0, 200),
        summary: 'AI conversation'
    });

    return response;
}

/**
 * Generate a new project from description
 */
async function generateProject(description) {
    console.log(`[IDE AI] Generate project: ${description}`);

    const prompt = `Based on this project description, generate a complete project structure.

PROJECT DESCRIPTION:
${description}

STEP 1: First, generate these documentation files:
- README.md (project overview, setup, usage)
- architecture.md (system design, components)
- features.md (all features explained)
- dataflow.md (how data moves through the system)
- systemflow.md (system processes)
- userflow.md (user journeys)
- about.md (project purpose and credits)

STEP 2: Then generate the actual code files for a working implementation.

For each file, use this format:
\`\`\`file:path/to/file.ext
content here
\`\`\`

Make sure to create a COMPLETE, WORKING project. Include all necessary files.`;

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: getIDESystemPrompt() },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 16000
    });

    const response = completion.choices[0].message.content;

    // Parse file blocks and extract files
    const files = parseFilesFromResponse(response);

    await memoryService.logAction('Project Generation', {
        request: description,
        filesCreated: files.map(f => f.path),
        summary: `Generated ${files.length} files for new project`
    });

    return { response, files };
}

/**
 * Debug code and explain errors
 */
async function debug(errorMessage, filePath = null) {
    console.log(`[IDE AI] Debug request`);

    let context = await buildCodebaseContext();

    let prompt = `Debug this error and explain the issue:\n\n`;
    prompt += `ERROR:\n${errorMessage}\n\n`;

    if (filePath) {
        try {
            const fileContent = await workspaceService.readFile(filePath);
            prompt += `RELEVANT FILE (${filePath}):\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        } catch (e) { }
    }

    prompt += `CODEBASE CONTEXT:\n${context}\n\n`;
    prompt += `Please:\n1. Explain what's causing the error\n2. Identify the problematic code\n3. Provide a fix using the file format:\n\`\`\`file:path/to/file.ext\nfixed code\n\`\`\``;

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: getIDESystemPrompt() },
            { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 8192
    });

    const response = completion.choices[0].message.content;
    const files = parseFilesFromResponse(response);

    await memoryService.logAction('Debug', {
        request: errorMessage.slice(0, 200),
        filesModified: files.map(f => f.path),
        summary: 'Debugging and fix proposal'
    });

    return { response, files };
}

/**
 * Edit/refactor code
 */
async function editCode(instruction, targetFile = null) {
    console.log(`[IDE AI] Edit request: ${instruction.slice(0, 100)}`);

    let context = await buildCodebaseContext();

    let prompt = `INSTRUCTION: ${instruction}\n\n`;

    if (targetFile) {
        try {
            const fileContent = await workspaceService.readFile(targetFile);
            prompt += `TARGET FILE (${targetFile}):\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        } catch (e) { }
    }

    prompt += `CODEBASE:\n${context}\n\n`;
    prompt += `Make the requested changes. Return modified files using:\n\`\`\`file:path/to/file.ext\nupdated content\n\`\`\``;

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: getIDESystemPrompt() },
            { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 8192
    });

    const response = completion.choices[0].message.content;
    const files = parseFilesFromResponse(response);

    await memoryService.logAction('Code Edit', {
        request: instruction.slice(0, 200),
        filesModified: files.map(f => f.path),
        summary: 'Code modification'
    });

    return { response, files };
}

/**
 * Parse file blocks from AI response
 * Format: ```file:path/to/file.ext
 */
function parseFilesFromResponse(response) {
    const files = [];
    const regex = /```file:([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(response)) !== null) {
        files.push({
            path: match[1].trim(),
            content: match[2]
        });
    }

    return files;
}

/**
 * Apply file changes to workspace
 */
async function applyChanges(files) {
    const results = [];

    for (const file of files) {
        try {
            await workspaceService.writeFile(file.path, file.content);
            results.push({ path: file.path, success: true });
        } catch (error) {
            results.push({ path: file.path, success: false, error: error.message });
        }
    }

    await memoryService.logAction('Apply Changes', {
        filesModified: files.map(f => f.path),
        summary: `Applied ${results.filter(r => r.success).length}/${files.length} changes`
    });

    return results;
}

module.exports = {
    chat,
    generateProject,
    debug,
    editCode,
    applyChanges,
    parseFilesFromResponse
};
