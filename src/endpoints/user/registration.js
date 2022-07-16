const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')
const {decrypt, decryptToken, encrypt} = require("../../tools/Crypto")
const {login} = require("./login")

export const registration = async function (data) {
    let r = {status: 200, result: {"message":"something went wrong"}}
    if (!fieldCheck(['name', 'login', 'password', 'agent'], data)) {
        if (!requiredFieldCheck(['name', 'login', 'password', 'agent'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }

    const originPassword = data.password
    data.password = JSON.stringify(encrypt(originPassword))
    r = await pool.query(`SELECT * from \`users\` WHERE user_login = '${data.login}'`).then(async response => {
        if (response[0].length > 0){
            r = {status: 500, result: {"message":"login is taken"}}
        }else {
            r = await pool.query(`INSERT INTO \`users\`(\`user_name\`, \`user_login\`, \`user_password\`) VALUES ('${data.name}', '${data.login}', '${data.password}')`).then(async response => {
                r = await pool.query(`SELECT LAST_INSERT_ID() as id FROM \`users\``).then(async response => {
                    let newUserId = response[0][0].id
                    const userTag = '@' + data.name.replaceAll(' ', '_') + '_' + newUserId
                    r = await pool.query(`UPDATE \`users\` SET \`user_tag\`='${userTag}' WHERE id = '${newUserId}'`).then(async response => {
                        const dataLogin = { login: data.login, password: originPassword, agent: data.agent }
                        r = await login(dataLogin)
                        return r
                    })
                    return r
                })
                return r
            })
        }
        return r
    })

    return r
}