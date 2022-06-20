const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')
const {decrypt, decryptToken, encrypt} = require("../../tools/Crypto")

export const login = async function (data) {
    let r = {status: 400, result: "something went wrong"}
    if (!fieldCheck(['login', 'password', 'agent'], data)) {
        if (!requiredFieldCheck(['login', 'password', 'agent'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }

    r = await pool.query(`SELECT * from \`users\` WHERE user_login = '${data.login}'`).then(async response => {
        let userData = response[0][0]
        let userPass = decrypt(userData.user_password)
        if (userPass === data.password){
            const timestamp = Math.floor(Date.now() / 1000)
            const token = JSON.stringify(encrypt(JSON.stringify({
                auth:timestamp,
                id:userData.id,
                name:userData.user_name,
                tag:userData.user_tag
            })))
            r = await pool.query(`DELETE FROM sessions WHERE user = '${userData.id}' and agent = '${data.agent}'`).then(async response => {
                r = await pool.query(`INSERT INTO \`sessions\`( \`user\`, \`token\`, \`agent\`, \`date\`) VALUES ('${userData.id}','${token}','${data.agent}',CURRENT_TIMESTAMP)`).then(async response => {
                    r = {status: 200, result: {token:token}}
                    return r
                })
                return r
            })
        }else{
            r = {status: 400, result: "wrong password"}
        }
        return r
    })


    return r
}