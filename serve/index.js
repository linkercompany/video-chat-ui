const express = require('express')
const dotenv = require('dotenv')
const path = require('path') // path modülünü ekledik

const app = express()
dotenv.config()

app.set('trust proxy', 'loopback')

// Public
app.use(express.static('public'))

// Tüm istekleri yönlendir
app.get('/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Server'ı başlat ve istekleri dinle
const PORT = process.env.PORT || 8000 // Varsayılan olarak 8000 portunu kullan
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
