const mysql = require('mysql2')
const dbConfig = require('./DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

const {fieldCheck} = require('./FieldCheck')

export const clientCheck = async function (client) {
    let r = false
    if (!fieldCheck(['client', 'api_key'], client)) { return false }

    r = await pool.query(`SELECT * FROM \`rest\` WHERE \`client\` = "${client.client}" AND api_key = "${client.api_key}"`).then(async response => {
        if (response[0].length > 0){r = true}
        return r
    })
    return r
}