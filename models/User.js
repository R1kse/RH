const {Schema, model} = require('mongoose')


const User = new Schema({
    username: {type: String, unique: true, required: true},
    nickname: {type: String},
    password: {type: String, required: true},
    roles: [{type: String, ref: 'Role'}],
    entryDate: {type:Date, default:Date.now}

})

module.exports = model('User', User)
