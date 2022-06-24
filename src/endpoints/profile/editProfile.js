import {getProfile} from "./getProfile";

const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt, encrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const editProfile = async function (data){
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
            const acceptPassword = (decrypt(response.user_password) === data.oldPassword)
            const updatedTag = `@${data.name.replaceAll(' ','_')}_`+userData.id
            if(acceptPassword){
                const newPassword = JSON.stringify(encrypt(data.newPassword))
                await pool.query(`UPDATE \`users\` SET \`user_password\`='${newPassword}' WHERE id ='${userData.id}'`)
            }
            await pool.query(`UPDATE \`users\` SET \`user_name\`='${data.name}',\`user_tag\`='${updatedTag}',\`user_login\`='${data.login}',\`user_avatar\`='${data.avatar}' WHERE id = '${userData.id}'`)
            return true
        }
        return false
    })

    if (r){
        let userNewData = await getProfile({token: data.token})
        r = {
            status: 200,
            result: {
                result: "saved successful",
                saved: userNewData.result
            }
        }
    }else{
        r = {
            status: 200,
            result: "error"
        }
    }


    return r
}