const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const getProfile = async function (data){
    let r = {status:400, result: "something went wrong"}
    if (!fieldCheck(['token'], data)) {
        if (!requiredFieldCheck(['token'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    r = await pool.query(`SELECT * FROM users WHERE id = '${userData.id}'`).then(async response => {
        response = response[0][0]
        if (response){
            response = {
                id:response.id,
                name:response.user_name,
                tag:response.user_tag,
                login:response.user_login,
                avatar:response.user_avatar
            }
        }
        return {
            status:200,
            result: response || {}
        }
    })

    return r
}