const {Schema, model} = require('mongoose')


const Basket = new Schema({
    username: {type: String, required: true},
    device_id:[{type: String}],
})

module.exports = model('Basket', Basket)