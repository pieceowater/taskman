const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')
const {decrypt, decryptToken, encrypt} = require("../../tools/Crypto")

export const registration = async function (data) {
    let r = {status: 200, result: data}
    if (!fieldCheck(['name', 'login', 'password', 'agent'], data)) {
        if (!requiredFieldCheck(['name', 'login', 'password', 'agent'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }

    data.password = JSON.stringify(encrypt(data.password))
    r = await pool.query(`INSERT INTO \`users\`(\`user_name\`, \`user_login\`, \`user_password\`) VALUES ('${data.name}', '${data.login}', '${data.password}')`).then(async response => {
        r = await pool.query(`SELECT LAST_INSERT_ID() as id FROM \`users\``).then(async response => {
            let newUserId = response[0][0].id
            const userTag = '@' + data.name.replaceAll(' ', '_') + '_' + newUserId

            r = await pool.query(`UPDATE \`users\` SET \`user_tag\`='${userTag}' WHERE id = '${newUserId}'`).then(async response => {
                r = {status: 200, result: "ok"}
                return r
            })
            return r
        })
        return r
    })

    return r
}