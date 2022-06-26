const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const deleteTask = async function (data) {
    let r = {status: 400, result: "something went wrong"}
    if (!fieldCheck(['token', 'id'], data)) {
        if (!requiredFieldCheck(['token', 'id'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }
    try {
        decrypt(data.token)
    } catch (e) {
        r = {status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    const isAuthor = await pool.query(`select author
                                       from tasks
                                       where id = ${data.id}`).then(response => {
        return (response[0][0].author == userData.id)
    })
    if (isAuthor) {
        r = await pool.query(`select author
                              from tasks
                              where id = ${data.id}`).then(response => {
            return {status: 200, result: `delete this task successful`}
        })
    } else {
        r = {status: 400, result: `user ${userData.name}(${userData.id}) can not delete this task`}
    }
    return r
}