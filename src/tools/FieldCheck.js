export const fieldCheck = function (need, fields) {
    let r = true
    need.forEach(n => {
        if (!fields[n]){
            r = false
        }
    })
    return r
}