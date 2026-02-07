import { useState, useEffect } from 'react'
import { FiFile, FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import './FileTree.css'

function FileTreeItem({ item, onFileSelect, level = 0 }) {
    const [isOpen, setIsOpen] = useState(false)

    const getFileIcon = (ext) => {
        const icons = {
            'js': '📜', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
            'py': '🐍', 'html': '🌐', 'css': '🎨', 'json': '📋',
            'md': '📝', 'txt': '📄'
        }
        return icons[ext] || '📄'
    }

    if (item.type === 'directory') {
        return (
            <div className="tree-item">
                <div
                    className="tree-folder"
                    style={{ paddingLeft: `${level * 16}px` }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                    <FiFolder className="folder-icon" />
                    <span>{item.name}</span>
                </div>
                {isOpen && item.children && (
                    <div className="tree-children">
                        {item.children.map((child, idx) => (
                            <FileTreeItem
                                key={idx}
                                item={child}
                                onFileSelect={onFileSelect}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            className="tree-file"
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => onFileSelect(item.path)}
        >
            <span className="file-icon">{getFileIcon(item.extension)}</span>
            <span>{item.name}</span>
        </div>
    )
}

function FileTree({ files, onFileSelect, isLoading }) {
    if (isLoading) {
        return <div className="file-tree loading">Loading files...</div>
    }

    if (!files || files.length === 0) {
        return <div className="file-tree empty">No files yet</div>
    }

    return (
        <div className="file-tree">
            <div className="tree-header">
                <h3>📁 Explorer</h3>
            </div>
            <div className="tree-content">
                {files.map((item, idx) => (
                    <FileTreeItem key={idx} item={item} onFileSelect={onFileSelect} />
                ))}
            </div>
        </div>
    )
}

export default FileTree
