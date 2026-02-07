import Editor from '@monaco-editor/react'
import './CodeEditor.css'

function CodeEditor({ filePath, content, onChange, language = 'javascript' }) {

    const getLanguage = (path) => {
        if (!path) return 'plaintext'
        const ext = path.split('.').pop()?.toLowerCase()
        const langMap = {
            'js': 'javascript', 'jsx': 'javascript',
            'ts': 'typescript', 'tsx': 'typescript',
            'py': 'python', 'html': 'html', 'css': 'css',
            'json': 'json', 'md': 'markdown', 'txt': 'plaintext',
            'java': 'java', 'cpp': 'cpp', 'c': 'c'
        }
        return langMap[ext] || 'plaintext'
    }

    return (
        <div className="code-editor">
            {filePath ? (
                <>
                    <div className="editor-header">
                        <span className="file-path">{filePath}</span>
                    </div>
                    <Editor
                        height="calc(100% - 40px)"
                        language={getLanguage(filePath)}
                        value={content}
                        onChange={onChange}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            padding: { top: 10 }
                        }}
                    />
                </>
            ) : (
                <div className="editor-placeholder">
                    <div className="placeholder-content">
                        <span className="placeholder-icon">📝</span>
                        <p>Select a file to edit</p>
                        <p className="placeholder-hint">or ask AI to generate code</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CodeEditor
