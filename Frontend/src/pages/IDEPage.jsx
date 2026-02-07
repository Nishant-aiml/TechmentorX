import { useState, useEffect } from 'react'
import axios from 'axios'
import WorkspaceSelector from '../components/ide/WorkspaceSelector'
import FileTree from '../components/ide/FileTree'
import CodeEditor from '../components/ide/CodeEditor'
import AIChat from '../components/ide/AIChat'
import './IDEPage.css'

const API_BASE = 'http://localhost:3000/ide'

function IDEPage() {
    const [workspace, setWorkspace] = useState(null)
    const [isNewProject, setIsNewProject] = useState(false)
    const [files, setFiles] = useState([])
    const [isLoadingFiles, setIsLoadingFiles] = useState(false)
    const [currentFile, setCurrentFile] = useState(null)
    const [fileContent, setFileContent] = useState('')
    const [messages, setMessages] = useState([])
    const [pendingFiles, setPendingFiles] = useState([])
    const [isAILoading, setIsAILoading] = useState(false)

    // Open workspace
    const handleWorkspaceSelected = async (path) => {
        try {
            const response = await axios.post(`${API_BASE}/workspace/open`, { path })
            setWorkspace(path)
            setIsNewProject(response.data.isNewProject)
            loadFiles()
        } catch (error) {
            console.error('Failed to open workspace:', error)
            alert('Failed to open workspace. Make sure the path exists.')
        }
    }

    // Load file tree
    const loadFiles = async () => {
        setIsLoadingFiles(true)
        try {
            const response = await axios.get(`${API_BASE}/workspace/files`)
            setFiles(response.data.files || [])
        } catch (error) {
            console.error('Failed to load files:', error)
        }
        setIsLoadingFiles(false)
    }

    // Select and load a file
    const handleFileSelect = async (filePath) => {
        try {
            const response = await axios.get(`${API_BASE}/file`, { params: { path: filePath } })
            setCurrentFile(filePath)
            setFileContent(response.data.content)
        } catch (error) {
            console.error('Failed to load file:', error)
        }
    }

    // Save file content
    const handleContentChange = async (newContent) => {
        setFileContent(newContent)
        if (currentFile) {
            try {
                await axios.post(`${API_BASE}/file`, { path: currentFile, content: newContent })
            } catch (error) {
                console.error('Failed to save file:', error)
            }
        }
    }

    // Send message to AI
    const handleSendMessage = async (message) => {
        setMessages(prev => [...prev, { role: 'user', content: message }])
        setIsAILoading(true)

        try {
            let response

            // Check if it's a project generation request
            if (isNewProject &&
                (message.toLowerCase().includes('build') ||
                    message.toLowerCase().includes('create') ||
                    message.toLowerCase().includes('generate'))) {
                response = await axios.post(`${API_BASE}/generate`, { description: message })
            } else if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('error')) {
                response = await axios.post(`${API_BASE}/debug`, {
                    error: message,
                    file: currentFile
                })
            } else if (message.toLowerCase().includes('edit') ||
                message.toLowerCase().includes('modify') ||
                message.toLowerCase().includes('refactor') ||
                message.toLowerCase().includes('optimize')) {
                response = await axios.post(`${API_BASE}/edit`, {
                    instruction: message,
                    file: currentFile
                })
            } else {
                response = await axios.post(`${API_BASE}/chat`, { message })
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])

            // If there are files to apply
            if (response.data.files && response.data.files.length > 0) {
                setPendingFiles(response.data.files)
            }
        } catch (error) {
            console.error('AI error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, something went wrong. Please check your API key and try again.'
            }])
        }

        setIsAILoading(false)
    }

    // Apply pending file changes
    const handleApplyFiles = async () => {
        try {
            await axios.post(`${API_BASE}/apply`, { files: pendingFiles })
            setPendingFiles([])
            loadFiles()
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '✅ Changes applied successfully!'
            }])
        } catch (error) {
            console.error('Failed to apply changes:', error)
        }
    }

    // Reject pending changes
    const handleRejectFiles = () => {
        setPendingFiles([])
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🚫 Changes rejected.'
        }])
    }

    // Close workspace
    const handleCloseWorkspace = () => {
        setWorkspace(null)
        setFiles([])
        setCurrentFile(null)
        setFileContent('')
        setMessages([])
        setPendingFiles([])
    }

    // If no workspace selected, show selector
    if (!workspace) {
        return <WorkspaceSelector onWorkspaceSelected={handleWorkspaceSelected} />
    }

    return (
        <div className="ide-layout">
            <div className="ide-sidebar">
                <div className="workspace-header">
                    <span className="workspace-name" title={workspace}>
                        📁 {workspace.split(/[\\/]/).pop()}
                    </span>
                    <button className="close-btn" onClick={handleCloseWorkspace}>✕</button>
                </div>
                <FileTree
                    files={files}
                    onFileSelect={handleFileSelect}
                    isLoading={isLoadingFiles}
                />
            </div>

            <div className="ide-editor">
                <CodeEditor
                    filePath={currentFile}
                    content={fileContent}
                    onChange={handleContentChange}
                />
            </div>

            <div className="ide-chat">
                <AIChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    pendingFiles={pendingFiles}
                    onApplyFiles={handleApplyFiles}
                    onRejectFiles={handleRejectFiles}
                    isLoading={isAILoading}
                />
            </div>
        </div>
    )
}

export default IDEPage
