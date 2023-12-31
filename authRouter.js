const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require("express-validator")
const authMiddleware = require('./middlewaree/authMiddleware')
const roleMiddleware = require('./middlewaree/roleMiddleware')

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым"),
    check('nickname', "Имя пользователя может быть пустым"),
    check('password', "Пароль должен быть больше 4 и меньше 10 символов")
], controller.registration)
router.post('/login', controller.login)
// router.get('/devices', roleMiddleware(["ADMIN"]), controller.getDevices)
// router.get('/categories', roleMiddleware(["ADMIN"]), controller.getDevices)
module.exports = router
