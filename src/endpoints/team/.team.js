const {clientCheck} = require('../../tools/ClientCheck')
const {fieldCheck} = require('../../tools/FieldCheck')

const {searchTeammate} = require("./searchTeammate");
const {requestTeammate} = require("./requestTeammate");
const {allTeammateRequests} = require("./allTeammateRequests");

export const team = async function (data) {
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
        case "searchTeammate":
            r = await searchTeammate(data.data)
            break
        case "requestTeammate":
            r = await requestTeammate(data.data)
            break
        case "allTeammateRequests":
            r = await allTeammateRequests(data.data)
            break
        case "acceptTeammate":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        case "removeTeammate":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        case "allTeammate":
            r = {status: 200, result: "action \""+data.action+"\" is still in progress"}
            break
        default:
            r = {status: 400, result: "action \""+data.action+"\" is undefined"}
            break
    }

    return r
}