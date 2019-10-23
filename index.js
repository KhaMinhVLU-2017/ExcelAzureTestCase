const express = require('express')
const app = express()
const router = require('./router')
const port = 3000

app.use('/api', router)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))