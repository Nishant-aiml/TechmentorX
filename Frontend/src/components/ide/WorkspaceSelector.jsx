import { useState, useRef } from 'react'
import { FiFolder, FiFolderPlus, FiClock, FiArrowLeft } from 'react-icons/fi'
import './WorkspaceSelector.css'

function WorkspaceSelector({ onWorkspaceSelected }) {
    const [recentWorkspaces, setRecentWorkspaces] = useState([])
    const [folderPath, setFolderPath] = useState('')
    const [showManualInput, setShowManualInput] = useState(false)

    const handleOpenFolder = async () => {
        // For web environment, we'll use manual path input
        setShowManualInput(true)
    }

    const handleConfirmPath = async () => {
        if (folderPath.trim()) {
            onWorkspaceSelected(folderPath.trim())
        }
    }

    const handleCreateNew = () => {
        setShowManualInput(true)
        setFolderPath('')
    }

    return (
        <div className="workspace-selector">
            <div className="workspace-header">
                <h1>🚀 AI IDE</h1>
                <p>Select a workspace to start coding with AI assistance</p>
            </div>

            <div className="workspace-options">
                <div className="option-card" onClick={handleOpenFolder}>
                    <FiFolder className="option-icon" />
                    <h3>Open Folder</h3>
                    <p>Open an existing project</p>
                </div>

                <div className="option-card" onClick={handleCreateNew}>
                    <FiFolderPlus className="option-icon" />
                    <h3>New Project</h3>
                    <p>Create a new project with AI</p>
                </div>
            </div>

            {showManualInput && (
                <div className="manual-input-section">
                    <input
                        type="text"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        placeholder="Enter folder path (e.g., C:\Projects\my-app)"
                        className="path-input"
                    />
                    <div className="input-buttons">
                        <button onClick={handleConfirmPath} className="btn-primary">
                            Open Workspace
                        </button>
                        <button onClick={() => setShowManualInput(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {recentWorkspaces.length > 0 && (
                <div className="recent-section">
                    <h3><FiClock /> Recent Workspaces</h3>
                    <ul>
                        {recentWorkspaces.map((ws, idx) => (
                            <li key={idx} onClick={() => onWorkspaceSelected(ws.path)}>
                                {ws.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default WorkspaceSelector
