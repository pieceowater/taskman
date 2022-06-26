export const fieldCheck = function (need, fields) {
    let r = true
    need.forEach(n => {
        fields[n] = fields[n] === 0 ? fields[n].toString() : fields[n]
        if (!fields[n]) {
            r = false
        }
    })
    return r
}
export const requiredFieldCheck = function (need, fields) {
    let r = true
    need.forEach(n => {
        if ((fields[n] == null) || (fields[n] === '')) {
            r = false
        }
    })
    return r
}