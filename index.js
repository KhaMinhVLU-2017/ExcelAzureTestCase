const express = require('express')
const app = express()
const router = require('./router')
const port = 3000
const axios = require('axios')

app.use('/api', router)

let server = app.listen(port, _ => {
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
            let count = 3
            console.log('Complete computed')
            let tInter = setInterval(() => {
                console.log(`Server will down ${count}`)
                count--
            }, 1000)
            setTimeout(() => {
                clearInterval(tInter)
                console.log('Stop server...!')
                server.close()
            }, 4000)
        })
})