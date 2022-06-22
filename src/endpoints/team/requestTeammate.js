const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const requestTeammate = async function (data){
    let r = {status:400, result: "something went wrong"}
    if (!fieldCheck(['token', 'usertag', 'id'], data)) {
        if (!requiredFieldCheck(['token', 'usertag', 'id'], data)) {
            r = {status: 400, result: "check data you sent in \"data\""}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: "json token is incorrect"}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    let usertag = data.usertag+'_'+data.id

    r = await pool.query(`SELECT requests FROM \`users\` WHERE user_tag = '${usertag}'`).then(async response => {
        r = response[0][0].requests
        if (r == null){
            r = {list: [
                    {
                        user:userData.tag,
                        date:Math.floor(Date.now() / 1000)
                    }
                ]}

        }else{
            r.list.push({
                user:userData.tag,
                date:Math.floor(Date.now() / 1000)
            })
        }

        r = await pool.query(`UPDATE \`users\` SET \`requests\`='${JSON.stringify(r)}' WHERE  user_tag = '${usertag}'`).then(async response => {
            return {
                status:200,
                result: "successful teammate request"
            }
        })
        return r
    })
    return r
}