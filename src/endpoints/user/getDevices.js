const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const getDevices = async function (data){
    let r = {status:400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token', 'agent'], data)) {
        if (!requiredFieldCheck(['token', 'agent'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    const userData = JSON.parse(decrypt(data.token))

    r = await pool.query(`SELECT * FROM sessions WHERE user = '${userData.id}' and agent != '${data.agent}'`).then(async response => {
        return {
            status:200,
            result: response[0]
        }
    })

    if (r.result.length === 0){
        r.result = {response: {"message":"only active device (this)"}}
    }
    return r
}