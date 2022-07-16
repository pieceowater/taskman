const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const profileTeammate = async function (data){
    let r = {status:400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token','user'], data)) {
        if (!requiredFieldCheck(['token','user'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: {"message":"json token is incorrect"}}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    const teammateData = await pool.query(`SELECT id, user_name as name, user_tag as tag, team, requests, user_avatar as avatar FROM users WHERE id = '${data.user}'`).then(async response => {
        return  response[0][0] || null
    })

    let isTeammate = false
    let isRequested = false
    if (teammateData.team) {
        for (const teammateTeam of teammateData.team.list) {
            if(teammateTeam.user == "@"+userData.name.replaceAll(' ','_')+"_"+userData.id){
                isTeammate = true
            }
        }
    }
    if (teammateData.requests) {
        for (const teammateRequests of teammateData.requests.list) {
            if(teammateRequests.user == "@"+userData.name.replaceAll(' ','_')+"_"+userData.id){
                isRequested = true
            }
        }
    }

    r = {
        isRequested: isRequested,
        isTeammate: isTeammate,
        profile: teammateData
    }

    return {status:200, result: r}
}