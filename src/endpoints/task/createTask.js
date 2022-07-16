const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";

const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

const {editTask} = require("./editTask");

export const createTask = async function (data) {
    let r = {status: 400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token', 'name', 'description', 'parent', 'content'], data)) {
        if (!requiredFieldCheck(['token', 'name', 'description', 'parent', 'content'], data)) {
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
    const timestamp = Math.floor(Date.now() / 1000)
    const users = JSON.stringify({
        "executors": [
            {
                "date": timestamp,
                "user": userData.tag,
                "complete": false
            }
        ]
    })
    const content = JSON.stringify({
        "components": []
    })

    const newTaskId = await pool.query(`INSERT INTO \`tasks\`(\`name\`, \`description\`, \`author\`, \`content\`,
                                                              \`users\`, \`parent\`)
                                        VALUES ('${data.name}', '${data.description}', '${userData.id}', '${content}',
                                                '${users}', '${data.parent}')`).then(async response => {
        const lastId = await pool.query(`SELECT LAST_INSERT_ID() as id
                                         FROM tasks`).then(async response => {
            return response[0][0]
        })
        return lastId.id
    })

    r = (await editTask({token: data.token, id: newTaskId, content: data.content, users: data.users})).result

    return {status: 200, result: r}
}