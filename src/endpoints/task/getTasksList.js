const mysql = require('mysql2')
const dbConfig = require('../../tools/DBConnection')
const pool = mysql.createPool(dbConfig.dbConfig).promise()

import {decrypt} from "../../tools/Crypto";
const {fieldCheck, requiredFieldCheck} = require('../../tools/FieldCheck')

export const getTasksList = async function (data){

    let r = {status:400, result: {"message":"something went wrong"}}
    if (!fieldCheck(['token', 'sort', 'filter', 'subtaskParent'], data)) {
        if (!requiredFieldCheck(['token', 'sort', 'filter', 'subtaskParent'], data)) {
            r = {status: 400, result: {"message":"check data you sent in \"data\""}}
        }
        return r
    }
    try { decrypt(data.token) } catch (e) {
        r = { status: 400, result: {"message":"json token is incorrect"}}
        return r;
    }
    const userData = JSON.parse(decrypt(data.token))

    let sort = (data.sort === "asc")||(data.sort === "desc")
    sort = sort ? "GROUP BY id "+data.sort.toUpperCase() : ""


    let parent = (typeof parseInt(data.subtaskParent))==="number" ? data.subtaskParent : false
    parent = (!isNaN(parent))?" AND parent = "+parent:" AND parent = 0"
    if(((data.filter.inprogress===undefined)||(data.filter.completed===undefined))||((typeof data.filter.inprogress != "boolean")||(typeof data.filter.completed != "boolean"))){
        return {status: 400, result: {"message":"filter is incorrect"}}
    }

    let filter
    if ((data.filter.inprogress) ^ (data.filter.completed)){
        filter = data.filter.completed
    }else {
        filter = "all"
    }
    const tasksList = await pool.query(`SELECT * FROM \`tasks\` WHERE users LIKE '%"${userData.tag}"%' ${parent} ${sort}`).then(async response => {
        response = response[0]
        const taskList = {tasks:[]}
        if (response.length>0) {
            if (filter!=="all"){
                for (const task of response){
                    let isOK = true
                    for (const taskUser of task.users.executors){
                        if(taskUser.complete !== filter){
                            isOK = false
                        }
                    }
                    if (isOK){
                        taskList.tasks.push(task)
                    }
                }
            }else {
                taskList.tasks = response
            }
        }

            return taskList
    })

    return {status: 200, result: tasksList}
}