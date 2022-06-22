const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const searchTeammate = async function (data){
    let r = {status:400, result: "something went wrong"}
    if (!fieldCheck(['token', 'usertag'], data)) {
        if (!requiredFieldCheck(['token', 'usertag'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    r = await pool.query(`SELECT * FROM \`users\` WHERE user_tag LIKE '%${data.usertag}%'`).then(async response => {
        r = []
        response[0].forEach( user_data => {

            let user = {
                id: user_data.id,
                name: user_data.user_name,
                tag: user_data.user_tag.substr(0, user_data.user_tag.indexOf(user_data.user_tag.split('_')[user_data.user_tag.split('_').length-1])-1),
                avatar: user_data.user_avatar
            }
             r.push(user)
        })
        return {
            status:200,
            result: r
        }
    })

    return r
}