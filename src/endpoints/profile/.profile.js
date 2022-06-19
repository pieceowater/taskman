const {clientCheck} = require('../../tools/ClientCheck')
const {fieldCheck} = require('../../tools/FieldCheck')
export const profile = async function (data) {
    let r = {status: 500, result: "something went wrong"}
    try { data = JSON.parse(data) } catch (e) {
        r = { status: 400, result: "json is incorrect"}
        return r;
    }

    if (!fieldCheck(['auth', 'action', 'data'], data)) {
        r = { status: 400, result: "check data you sent"}
        return r
    }

    if (!await clientCheck(data.auth)){
        r = { status: 400, result: "client auth failed"}
        return r
    }

    switch (data.action){
        case "getProfile":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        case "editProfile":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        case "getProfileStat":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        default:
            r = {status: 400, result: "action \""+data.action+"\" is undefined"}
            break
    }

    return r
}