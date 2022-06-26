const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

const {getTaskInfo} = require("./getTaskInfo");

export const editTask = async function (data) {
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

    let changes = false
    let sql = ` UPDATE \`tasks\`
                SET `

    changes = (!!data.name) || (!!data.description) || (!!data.content) || (!!data.users)

    sql += (!!data.name) ? ` \`name\` = '${data.name}', ` : ""

    sql += (!!data.description) ? ` \`description\` = '${data.description}', ` : ""

    sql += (!!data.content) ? ` \`content\` = '${JSON.stringify(data.content)}', ` : ""

    if (isAuthor) {
        sql += (!!data.users) ? ` \`users\` = '${JSON.stringify(data.users)}', ` : ""
    }

    sql += ` WHERE id = ${data.id} `
    sql = sql.substring(0, sql.lastIndexOf(',')) + sql.substring(sql.lastIndexOf(',') + 1, sql.length)

    !changes ? sql = null : sql
    if (sql) {
        await pool.query(sql)
        r = (await getTaskInfo({token: data.token, id: data.id})).result
    }
    return {status: 200, result: r}
}