//how to use
// const {encrypt, decrypt} = require('./Crpyto')
// const hash = encrypt('1q2w3e4r5t')
// const text = decrypt(hash)

//for front decode example
// let t = "382785d18fe7904ea80f70434af6166f.9729d74fa54acbd5cf8b174f1b51a5619b7f5b3d203b10b9f2d8dfdcca076efe90606975d427e428ae2de719c0928e5c38d7c149cc4f".split('.')
// let hash = {iv: t[0], content: t[1]}
// token = decrypt(hash)

const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdMpNWtRRImid7rdxs01lwHzfr3'

const encrypt = (text) => {

    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

const decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

    return decrpyted.toString()
}

//mine
const isJson = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


const decryptToken = (token) => {
    let r = ""
    if (token.split('.').length > 1) {
        try {
            let decrpytedToken = decrypt({
                iv: token.split('.')[0],
                content: token.split('.')[1]
            })

            if (isJson(decrpytedToken)) {
                r = JSON.parse(decrpytedToken)
            }
        } catch (err) {
            r = ''
        }
    }
    return r
}


module.exports = {
    encrypt,
    decrypt,
    decryptToken
}