# About AI IDE

## Overview

AI IDE is a **local AI-powered coding environment** that combines intelligent code review with full development capabilities.

## What It Does

### 🆕 AI IDE Page (`/ide`)

A complete IDE interface that provides:

1. **Workspace Management**
   - Open any local folder as workspace
   - Detect if project is new (empty) or existing

2. **Project Generation**
   - Describe what you want: "Build me a todo app"
   - AI generates documentation first (README, architecture, etc.)
   - Then generates actual code files

3. **Codebase Understanding**
   - Automatically reads all files in workspace
   - Builds context for AI conversations
   - No need to paste code manually

4. **Debugging Assistant**
   - Paste error messages
   - AI analyzes codebase and explains issues
   - Proposes fixes with code diffs

5. **Code Editing**
   - Natural language instructions
   - AI modifies relevant files
   - Preview changes before applying

6. **Memory System**
   - Tracks all AI-assisted changes
   - Maintains `history.md` in workspace
   - Full audit trail

### Backend Services

- `workspace.service.js` - File system operations
- `ide-ai.service.js` - AI chat, generation, debugging
- `memory.service.js` - History tracking
- `ide.routes.js` - All IDE API endpoints

### Frontend Components

- `WorkspaceSelector` - Project selection UI
- `FileTree` - File explorer sidebar
- `CodeEditor` - Monaco-based editor
- `AIChat` - AI conversation interface

## Technology Decisions

| Aspect | Choice | Reason |
|--------|--------|--------|
| AI Provider | OpenAI GPT-5-nano | Fast and capable |
| Editor | Monaco | VS Code-like experience |
| Routing | React Router | Clean page separation |
| Styling | Plain CSS | Lightweight |

## Key Features

1. **File-aware AI** - Reads codebase automatically
2. **Project generation** - From natural language
3. **Apply-changes flow** - Preview before commit
4. **Memory system** - Tracks all interactions

---

*Built with 🚀 AI IDE*
