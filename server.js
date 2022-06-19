const express = require('express')
const bodyParser = require('body-parser')
const {decrypt, decryptToken, encrypt} = require("./src/tools/Crpyto")

const {welcome} = require("./src/endpoints/Welcome");

const app = express()
app.use(bodyParser.text({type: '*/*'}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    return res.status(welcome().status).send(welcome().result)
})







app.listen(8021, () => {
    console.log('listening on port 8021!')
})