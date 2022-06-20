const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const logout = async function (data){
    let r = {status:400, result: "something went wrong"}
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    r = await pool.query(`DELETE FROM sessions WHERE user = '${userData.id}' and agent = '${data.agent}'`).then(async response => {
        return {
            status:200,
            result: {logout:"success"}
        }
    })

    return r
}