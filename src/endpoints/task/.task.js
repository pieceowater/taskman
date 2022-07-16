const {clientCheck} = require('../../tools/ClientCheck')
const {fieldCheck} = require('../../tools/FieldCheck')

const {getTasksList} = require("./getTasksList");
const {getTaskInfo} = require("./getTaskInfo");
const {createTask} = require("./createTask");
const {editTask} = require("./editTask");
const {deleteTask} = require("./deleteTask");

export const task = async function (data) {
    let r = {status: 500, result: "something went wrong"}
    try {
        data = JSON.parse(data)
    } catch (e) {
        r = {status: 400, result: {"message":"json is incorrect"}}
        return r;
    }

    if (!fieldCheck(['auth', 'action', 'data'], data)) {
        r = {status: 400, result: {"message":"check data you sent"}}
        return r
    }

    if (!await clientCheck(data.auth)) {
        r = {status: 400, result: {"message":"client auth failed"}}
        return r
    }

    switch (data.action) {
        case "getTasksList":
            r = await getTasksList(data.data)
            break
        case "createTask":
            r = await createTask(data.data)
            break
        case "editTask":
            r = await editTask(data.data)
            break
        case "getTaskInfo":
            r = await getTaskInfo(data.data)
            break
        case "deleteTask":
            r = await deleteTask(data.data)
            break
        default:
            r = {status: 400, result: {"message":"action \"" + data.action + "\" is undefined"}}
            break
    }

    return r
}