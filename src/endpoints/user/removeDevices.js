const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const removeDevices = async function (data){
    let r = {status:400, result: {"message":"something went wrong"}}

    if (!fieldCheck(['logout', 'agent', 'token'], data)) {
        if (!requiredFieldCheck(['logout', 'agent', 'token'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: {"message":"json token is incorrect"}}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))



    let logout = ""
    if (data.logout === "true"){
        logout = `and agent = '${data.agent}'`
    }

    r = await pool.query(`DELETE FROM sessions WHERE user = '${userData.id}' ${logout}`).then(async response => {
        r = {
            status:200,
            result: {"removeDevices":"success"}
        }
        return r
    })

    return r
}