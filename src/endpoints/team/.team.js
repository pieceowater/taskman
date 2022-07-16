const {clientCheck} = require('../../tools/ClientCheck')
const {fieldCheck} = require('../../tools/FieldCheck')

const {searchTeammate} = require("./searchTeammate");
const {requestTeammate} = require("./requestTeammate");
const {allTeammateRequests} = require("./allTeammateRequests");
const {acceptTeammate} = require("./acceptTeammate");
const {removeTeammate} = require("./removeTeammate");
const {allTeammate} = require("./allTeammate");
const {profileTeammate} = require("./profileTeammate");

export const team = async function (data) {
    let r = {status: 500, result: "something went wrong"}
    try { data = JSON.parse(data) } catch (e) {
        r = { status: 400, result: {"message":"json is incorrect"}}
        return r;
    }

    if (!fieldCheck(['auth', 'action', 'data'], data)) {
        r = { status: 400, result: {"message":"check data you sent"}}
        return r
    }

    if (!await clientCheck(data.auth)){
        r = { status: 400, result: {"message":"client auth failed"}}
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
            r = await acceptTeammate(data.data)
            break
        case "removeTeammate":
            r = await removeTeammate(data.data)
            break
        case "allTeammate":
            r = await allTeammate(data.data)
            break
        case "profileTeammate":
            r = await profileTeammate(data.data)
            break
        default:
            r = {status: 400, result: {"message":"action \""+data.action+"\" is undefined"}}
            break
    }

    return r
}