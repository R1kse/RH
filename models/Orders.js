const {Schema, model} = require('mongoose')


const Order = new Schema({
    username: {type: String, required: true},
    email: {type: String},
    phone: {type: String },
    device_id:[{type: String}],
    entryDate: {type: String, default: new Date().toLocaleDateString('ru-RU', { timeZone: 'Asia/Almaty' })},
    entryTime: {type:String, default: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty' })},
    isComplete: {type: Boolean, default: false },
    isCancel: {type: Boolean, default: false },
})

module.exports = model('Order', Order)