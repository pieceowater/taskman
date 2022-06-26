const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const getTaskInfo = async function (data){
    let r = {status:400, result: "something went wrong"}
    if (!fieldCheck(['token','id'], data)) {
        if (!requiredFieldCheck(['token','id'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    const tasksInfo = await pool.query(`SELECT *  FROM \`tasks\` WHERE id = ${data.id}`).then(async response => {
        response = response[0][0]
        let isComplete = true
        for (const executor of response.users.executors){
            if(!executor.complete){
                isComplete = false
            }
        }
        response.isComplete = isComplete
        return response
    })
    r = { status: 200, result: tasksInfo}
    return r
}