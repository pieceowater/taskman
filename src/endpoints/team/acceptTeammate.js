const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const acceptTeammate = async function (data) {
    let r = {status: 400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token', 'usertag'], data)) {
        if (!requiredFieldCheck(['token', 'usertag'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    try {
        decrypt(data.token)
    } catch (e) {
        r = {status: 400, result: {"message":"json token is incorrect"}}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    await pool.query(`SELECT requests FROM \`users\` WHERE id = '${userData.id}'`).then(async response => {
        r = response[0][0].requests
        let i = 0
        for (const request of r.list){
            if (request.user === data.usertag){
                r.list.splice(i, 1)
            }
            i++
        }
        await pool.query(`UPDATE \`users\` SET \`requests\`='${JSON.stringify(r)}' WHERE  id = '${userData.id}'`)
    })

    r = await pool.query(`SELECT team FROM \`users\` WHERE id = '${userData.id}'`).then(async response => {
        r = response[0][0].team
        if (r == null){
            r = {list: [
                    {
                        user:data.usertag,
                        date:Math.floor(Date.now() / 1000)
                    }
                ]}

        }else{
            r.list.push({
                user:data.usertag,
                date:Math.floor(Date.now() / 1000)
            })
        }

        r = await pool.query(`UPDATE \`users\` SET \`team\`='${JSON.stringify(r)}' WHERE  id = '${userData.id}'`).then(async response => {
            return {
                status:200,
                result: {"message":"successful accept teammate"}
            }
        })
        return r
    })



    return r
}