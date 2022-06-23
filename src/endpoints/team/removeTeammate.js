const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const removeTeammate = async function (data) {
    let r = {status: 400, result: "something went wrong"}
    if (!fieldCheck(['token', 'usertag'], data)) {
        if (!requiredFieldCheck(['token', 'usertag'], data)) {
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

    r = await pool.query(`SELECT team FROM \`users\` WHERE id = '${userData.id}'`).then(async response => {
        r = response[0][0].team
        let i = 0
        for (const team of r.list){
            if (team.user === data.usertag){
                r.list.splice(i, 1)
            }
            i++
        }

        r = await pool.query(`UPDATE \`users\` SET \`team\`='${JSON.stringify(r)}' WHERE  id = '${userData.id}'`).then(async response => {
            return {
                status:200,
                result: "successful remove teammate"
            }
        })
        return r
    })



    return r
}