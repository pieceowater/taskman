import {editProfile} from "./editProfile";

const {clientCheck} = require('../../tools/ClientCheck')
const {fieldCheck} = require('../../tools/FieldCheck')
const {getProfile} = require("./getProfile");
const {getProfileStat} = require("./getProfileStat");

export const profile = async function (data) {
    let r = {status: 500, result: {"message":"something went wrong"}}
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
        case "getProfile":
            r = await getProfile(data.data)
            break
        case "editProfile":
            r = await editProfile(data.data)
            break
        case "getProfileStat":
            r = await getProfileStat(data.data)
            break
        default:
            r = {status: 400, result: {"message":"action \""+data.action+"\" is undefined"}}
            break
    }

    return r
}