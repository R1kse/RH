const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contactSchema = new Schema({
    email: {type:String, required:true},
    message: {type:String, required:true},
    entryDate: {type:Date, default:Date.now}
})

const deviceSchema = new Schema({
    name: {type:String, required:true},
    price: {type:Number, required:true},
    image: {type:String, required:true},
    category: {type:String, required:true},
    about: {type:String, required:true}
})
const descSchema = new Schema({
    device_id: {type:String, required:true},
    description:{
        type: Map,
        of: String, // тип значений в Map
      },
})

const categorySchema = new Schema({
    name: {type:String, required:true}
})

const Categories = mongoose.model('Categories', categorySchema, 'categories')
const Devices = mongoose.model('Devices', deviceSchema, 'devices')
const Descriptions = mongoose.model('Descriptions', descSchema, 'descriptions')
// const Users = mongoose.model('Users', userSchema, 'users')
const Contact = mongoose.model('Contact', contactSchema, 'contact_form')
const mySchemas = { 'Contact':Contact, 'Devices':Devices, 'Categories':Categories, 'Descriptions':Descriptions}
// 'Users':Users,
module.exports = mySchemas