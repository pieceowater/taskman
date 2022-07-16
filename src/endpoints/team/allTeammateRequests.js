const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const allTeammateRequests = async function (data){
    let r = {status:400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token'], data)) {
        if (!requiredFieldCheck(['token'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: {"message":"json token is incorrect"}}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

        r = await pool.query(`SELECT requests FROM \`users\` WHERE id = '${userData.id}'`).then(async response => {
            if (response[0][0].requests == null){
                return {
                    status: 200,
                    result: {"message":"no requests"}
                }
            }
            let list = []
            r = response[0][0].requests
            for (const row of r.list) {
                r = await pool.query(`SELECT * FROM \`users\` WHERE user_tag = '${row.user}'`).then(async response => {
                    list.push({
                        date: row.date,
                        id: response[0][0].id,
                        name: response[0][0].user_name,
                        tag: response[0][0].user_tag.substr(0, response[0][0].user_tag.indexOf(response[0][0].user_tag.split('_')[response[0][0].user_tag.split('_').length-1])-1),
                        avatar: response[0][0].user_avatar || ''
                    })
                })
            }

            return {
                status: 200,
                result: list
            }
        })

    return r
}