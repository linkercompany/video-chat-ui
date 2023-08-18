const express = require('express') // Http server
const dotenv = require('dotenv') // Dotenv
// const morgan = require("morgan");

// Initilaziation
const app = express()
dotenv.config()

app.set('trust proxy', 'loopback')
// app.use(morgan("combined"));

// Public
app.use(express.static('public'))
app.use('/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Start server and listen for requests
app.listen(process.env.PORT)
