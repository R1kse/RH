const User = require('./models/User')
const Role = require('./models/Role')
const Basket = require('./models/Basket')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const {secret} = require("./config")
const schemas = require('./models/schemas');
const Orders = require('./models/Orders');
const mongoose = require('mongoose');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )

}

class authController {
    async registration(req, res) {
        
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {username, nickname, password} = req.body;
            console.log(req.body)
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const haveBas = await Basket.findOne({username})
            if(haveBas){
                return res.status(400)
            }else{
            const basket = new Basket({username:username},{device_id:[]})
            await basket.save()
            }
            // const order = new Orders({username:username,email:'',phone:''},{device_id:[]})
            // await order.save()
            const userRole = await Role.findOne({value: "USER"})
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new User({email:username, username, nickname, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body
            const user = await User.findOne({username})
            if (!user) {
                return res.status(400).json({message: `Не верно введён логин или пароль`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Не верно введён логин или пароль`})
            }
            const token = generateAccessToken(user._id, user.roles)
            console.log(token, user)
            return res.json({ token, message: "Успешный вход" })
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }
}

module.exports = new authController()
