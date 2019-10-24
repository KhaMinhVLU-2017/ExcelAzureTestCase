const express = require('express')
const app = express()
const router = require('./router')
const port = 3000
const axios = require('axios')

app.use('/api', router)

app.listen(port, _ => {
    console.log(`Example app listening on port ${port}!`)
    let url = `http://localhost:${port}/api/json`
    axios.get(url)
        .then(function (response) {
            console.log('Computing...');
        })
        .catch(function (error) {
            console.log(error)
        })
        .finally(function () {
            console.log('Complete computed')
        })
})