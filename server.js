const express = require('express')
const bodyParser = require('body-parser')

const {welcome} = require("./src/endpoints/Welcome");
const {user} = require("./src/endpoints/user/.user");
const {team} = require("./src/endpoints/team/.team");
const {task} = require("./src/endpoints/task/.task");
const {profile} = require("./src/endpoints/profile/.profile");

const app = express()
app.use(bodyParser.text({type: '*/*'}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    const r = welcome()
    return res.status(r.status).send(r.result)
})

app.post('/user', async (req, res) => {
    const r = await user(req.body)
    return res.status(r.status).send(r.result)
})

app.post('/team', async (req, res) => {
    const r = await team(req.body)
    return res.status(r.status).send(r.result)
})

app.post('/task', async (req, res) => {
    const r = await task(req.body)
    return res.status(r.status).send(r.result)
})

app.post('/profile', async (req, res) => {
    const r = await profile(req.body)
    return res.status(r.status).send(r.result)
})





app.listen(8020, () => {
    console.log('listening on port 8020!')
})