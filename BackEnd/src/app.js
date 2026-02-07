const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const ideRoutes = require('./routes/ide.routes')
const cors = require('cors')

const app = express()

app.use(cors())


app.use(express.json({ limit: '50mb' }))

app.get('/', (req, res) => {
    res.send('Hello World')
})

// Original code review routes (preserved)
app.use('/ai', aiRoutes)

// New AI IDE routes (extension)
app.use('/ide', ideRoutes)

module.exports = app