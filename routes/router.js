const express = require('express')
const app = express();
const router = express.Router()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const schemas = require('../models/schemas')
const User = require('../models/User')
const Basket = require('../models/Basket')
const Orders = require('../models/Orders');
var ObjectId = require('mongodb').ObjectId; 
const roleMiddleware = require('../middlewaree/roleMiddleware')
const authMiddleware = require('../middlewaree/authMiddleware')
const http = require('http');
const {secret} = require('../config');
app.use(bodyParser.json());


router.post('/contact/:a', async(req, res) => {

  const {email, message} = req.body
  const action = req.params.a
  
  switch(action) {
    case "send":
      const contactData = {email: email, message: message}
      const newContact = new schemas.Contact(contactData)
      const saveContact = await newContact.save()
      if (saveContact) {
        res.send('Скоро мы свяжемся с вами!')
      } else {
        res.send('Ощибка отправления')
      }
      break;
      default:
        res.send('Ошибка запроса')
        break
  }

  res.end()
})

router.post('/desc/:a', async(req, res) => {

  const {device, title, description} = req.body
  const action = req.params.a
  const devices = schemas.Devices
  const descrip = schemas.Descriptions
  switch(action) {
    case "send":
      const FindId =  await devices.findOne({name:device})
      const DeviceId = FindId._id
      const candidate = await descrip.findOne({device_id:DeviceId})
      if(candidate === null){
        const descData = {
          device_id: DeviceId, 
           description: new Map([
          [title , description]
        ])}
        const newDesc = new schemas.Descriptions(descData)
        const saveDesc = await newDesc.save()
        if (saveDesc) {
          res.send('Описание добавлено')
        } else {
          res.send('Ощибка отправления')
        }
        break;
      }else{
        const pushData = await descrip.findOne({device_id: DeviceId});
        const DescMap = pushData.description
        DescMap.set(title, description);
        pushData.save()
        if (DescMap) {
          res.send('Повторное добавление описания!')
        } else {
          res.send('Ощибка отправления')
        }
        break;
    }
    case "delete":
      const Findd =  await devices.findOne({name:device})
      const DeviceID = Findd._id
      const candidated = await descrip.findOne({device_id:DeviceID})
      descrip.updateOne(
        { device_id: DeviceID}, // Условие для выбора документа
        { $unset:{ description: title} }, // Удаление ключа и значения
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Ключ и значение успешно удалены');
        }
      );
    console.log(Findd)
    default:
        res.send('Ошибка запроса')
        break
      }

  res.end()
})

router.post('/order/:a', async(req, res) => {

  const {order_id , username} = req.body
  const action = req.params.a
  switch(action) {
    case "complete":{
      var o_id = ""+new ObjectId(order_id)+""
      const findOrder = await Orders.findOneAndUpdate({_id:o_id},{isComplete: true},{new: true})
      if(findOrder){
        res.send('Заказ успешно изменен!')
        break

      }
      }
      case "uncomplete":{
        var o_id = ""+new ObjectId(order_id)+""
        const findOrder = await Orders.findOneAndUpdate({_id:o_id},{isComplete: false},{new: true})
        if(findOrder){
          res.send('Заказ успешно изменен!')
          break
  
        }
        }
    case "cancel":{
      var o_id = ""+new ObjectId(order_id)+""
      const findOrder = await Orders.findOneAndUpdate({_id:o_id},{isCancel: true},{new: true})
      if(findOrder){
        res.send('Заказ успешно изменен!')
        break

      }
      }
      case "uncancel":{
        var o_id = ""+new ObjectId(order_id)+""
        const findOrder = await Orders.findOneAndUpdate({_id:o_id},{isCancel: false},{new: true})
        if(findOrder){
          res.send('Заказ успешно изменен!')
          break
  
        }
        }
        case "user":{
          const devices = schemas.Devices;
          const deviceData = await devices.find({});
          const OrderData = await Orders.find({username:username,isCancel:false, isComplete: false})
          
          const deviceNames = OrderData.map(async (element) => {
            const orderID = element._id;
            const nameOfUser = element.username;
            const emailOfUser = element.email;
            const phoneOfUser = element.phone;
            const entryDate = element.entryDate;
            const entryTime = element.entryTime
            const ids = element.device_id;
          
            const Cart = [...new Set(ids)].map((id) => {
              const device = deviceData.find((d) => d.id === id);
              const arr = ids;
              const countMap = arr.reduce((acc, val) => {
                if (val in acc) {
                  acc[val]++;
                } else {
                  acc[val] = 1;
                }
                return acc;
              }, {});
          
              const priceMap = deviceData.reduce((acc, val) => {
                if (val in acc) {
                  var o_id = "" + new ObjectId(val) + "";
                  acc[val] = devices.find({ _id: o_id }).price;
                } else {
                  acc[val] = 1;
                }
                return acc;
              }, {});
          
              const countArr = Object.keys(countMap).map((val) => ({
                value: val,
                price: priceMap[val],
                count: countMap[val],
              }));
          
              const countValues = countArr.map((obj) => obj.count);
              const IdValues = countArr.map((obj) => obj.value);
          
              return {
                device_id: id,
                device_data: device,
                count: countValues,
                value: IdValues,
              };
            });
            const countValues = Cart.map((obj) => obj.count);
            const IdValues = Cart.map((obj) => obj.value);
            const GoodCart = JSON.stringify(Cart)
            return {
              
              orderAllData: {
                order_id:orderID,
                username: nameOfUser,
                email: emailOfUser,
                phone: phoneOfUser,
                entryDate:entryDate,
                entryTime:entryTime,
                Order: Cart,
                count: countValues,
                value: IdValues,
                
              },
            };
          });
          
          Promise.all(deviceNames).then((results) => {
            console.log(results);
            res.send(results)
          });
          // if(findOrder){
          //   console.log(findOrder)
          //   res.send(findOrder)
          //   break
    
          // }
          }
    case "find":{
       
    }
  }
})

router.post('/basket/:a', async(req, res) => {

  const {username, device_id, actions, email, phone} = req.body
  const action = req.params.a
  switch(action) {
    case "order":{
      try {
      const pushData = await Basket.findOne({username: username.User});
      const getArr = pushData.device_id
      if(getArr.length === 0){
       return res.send('У вас пустая корзина')
      }if(getArr.length > 0){
        const order = new Orders({ _id: new mongoose.Types.ObjectId(),username: username.User , email:email ,phone:phone, device_id:getArr})
        await order.save()
        const pullData = await Basket.updateOne({ username: username.User }, { $unset: { device_id: "" } })
      if (order && pullData) {
        res.send('Заявка отправлена!')
      } else {
          res.send('Ошибка добавления')
        }
        break;
      }
      } catch (error) {
        console.log(error)
        res.send('Ошибка добавления')

      }
    }
    case "add":{
     const pushData = await Basket.findOneAndUpdate({username: username}, {$push: {device_id: device_id}}, {new: true});
     if (pushData) {
      pushData
      res.send('Товар добавлен в корзину')
    } else {
        res.send('Ошибка добавления')
      }
      break;
    }
    case "update":{
      if(actions ==='plus'){
        const pushData = await Basket.findOneAndUpdate({username: username}, {$push: {device_id: device_id}}, {new: true});
        if (pushData) {
          pushData
        } else {
            res.send('Ошибка добавления')
          }
          break;
      }
      if(actions ==='minus'){
        const FindBasket = await Basket.findOne({username: username})
        const BasketArr = FindBasket.device_id
        const index = BasketArr.indexOf(device_id);
        const pullData = await Basket.updateOne({ username: username }, { $unset: { device_id: "" } })
        if (index > -1) {
          BasketArr.splice(index, 1);
          pullData
          if(pullData){
            const pushData = await Basket.findOneAndUpdate({username: username}, {$push: {device_id:BasketArr }}, {new: true});
            pushData
          }
        }
        if (BasketArr) {
        } else {
            res.send('Ошибка добавления')
          }
          break;
      }
    }
  }
  res.end()
})

router.post('/basket', async(req, res) => {
  const { username } = req.body
  try {
    const basket = await Basket.findOne({username: username });
    const ids = basket.device_id;
    const devices = schemas.Devices
    const deviceData = await devices.find({})
    const Cart =  [...new Set(ids)].map(id => {
      const device = deviceData.find(d => d.id === id);
      const arr = ids
      const countMap = arr.reduce((acc, val) => {
        if (val in acc) {
          acc[val]++;
        } else {
          acc[val] = 1;
        }
        return acc;
      }, {});
      const priceMap = [device].map((prices, val) => {
        if([device].map(element => element._id) === val){
        prices.push([device].map(element => element.price))
        }
        return prices;
      }, {});
      const countArr = Object.keys(countMap).map((val) => ({
        value: val,
        price: priceMap[val],
        count: countMap[val]
      }));
      const countValues = countArr.map(obj => obj.count);
      const priceValues = countArr.map(obj => obj.price);
      const IdValues = countArr.map(obj => obj.value);
      return {
        device_id: id,
        device_data: device,
        count: countValues,
        price: deviceData.find(elem => elem._id === id)?.price || 0 ,
        value: IdValues,
      };
    });
    console.log(Cart)
    res.status(200).json(Cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server error'});
  }
});

router.post('/auth/send', async(req, res) => {
  const {username, password} = req.body
  const postData = JSON.stringify({
    username: username,
    password: password
  });
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/auth/registration',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const requ =  http.request(options, (response) => {
    let data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      postArr = []
      postArr.push(JSON.parse(data));
      res.send(postArr);
    });
  }); 
  
  requ.on('error', (error) => {
    console.error(error);
    res.status(500).send('ошибкка');
  });
  
  requ.write(postData);
  requ.end();
})

router.post('/login/:a', async(req, res) => {
  const {username, password} = req.body
  const postData = JSON.stringify({
    username: username,
    password: password
  });
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const requ =  http.request(options, (response) => {
    let data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      postArr = []
      postArr.push(JSON.parse(data));
      res.send(postArr);
      console.log(postArr)
    });
  }); 
  
  requ.on('error', (error) => {
    console.error(error);
    res.status(500).send('ошибка');
  });
  requ.write(postData);
  requ.end();
})

router.post('/device/:a', roleMiddleware(["ADMIN"]),  async(req, res) => {

  const {id, name, price, image, category, device, about} = req.body
  const action = req.params.a
  const Devices = schemas.Devices
  const descrip = schemas.Descriptions
  switch(action) {
    case "send":
      try {
        if (category === '') {
          const deviceData = {name: name, price: price, image: image, category: 'all' }
          const newDevice = new schemas.Devices(deviceData)
          const saveDevice = await newDevice.save()
          if (saveDevice ) {
            const findNew = await Devices.findOne({name: name})
          const descData = {
            device_id: findNew._id, 
             description: new Map([
            ['Название' , 'Описание' ]
          ])}
          const newDesc = new schemas.Descriptions(descData)
          const saveDesc = await newDesc.save()
            res.send('Устройство добавлено')
          } else {
            res.send('Ошибка')
          }
          saveDesc
          break;
        }else{
          const deviceData = {name: name, price: price, image: image, category: category, about: about}
          const newDevice = new schemas.Devices(deviceData)
          const saveDevice = await newDevice.save()
          const findNew = await Devices.findOne({name: name})
          const descData = {
            device_id: findNew._id, 
             description: new Map([
            ['Название' , 'Описание' ]
          ])}
          const newDesc = new schemas.Descriptions(descData)
          const saveDesc = await newDesc.save()
          if (saveDevice && saveDesc) {
            res.send('Устройство добавлено')
          } else {
            res.send('Ошибка')
          }
        }
      }catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Обработка ошибки истекшего срока действия токена
          console.log('Ошибка: срок действия токена истек.');
        } else {
          // Обработка других ошибок
          console.log('Произошла другая ошибка:', error);
        }
      }
      break;
    case "delete":
      try {
        const deleteID = await Devices.findOne({name: device})
        const StringID = deleteID._id.toString()
        if(deleteID._id === null ){
          res.send('Ошибка удаления')
        }else{
        const deleteFromBasket = await Basket.updateMany({}, {$pull: {device_id: StringID}})
        const deleteDevice = await Devices.findOneAndDelete({name: device})
        if (deleteFromBasket && deleteDevice) {
          res.send('Устройство '+ device +' удалено!')
        } else {
          res.send('Ошибка удаления')
        }
        break;
        }
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Обработка ошибки истекшего срока действия токена
          console.log('Ошибка: срок действия токена истек.');
        } else {
          // Обработка других ошибок
          console.log('Произошла другая ошибка:', error);
        }
      }

    case "find":
      const descrip = schemas.Descriptions
      try {
        const findDevice = await Devices.findOne({name: device})
        const candidate = await descrip.findOne({device_id:findDevice._id})
        const descripp = candidate.description
        const name = findDevice.toObject()
        const arr = descripp === null ? [] : Array.from(descripp);
        name['desc'] = arr
        const mergedObj = {...name};
        if (mergedObj) {
          console.log(mergedObj)
          res.send([mergedObj])
          break
        } else {
          res.send('Ошибка')
      }
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Обработка ошибки истекшего срока действия токена
          console.log('Ошибка: срок действия токена истек.');
        } else {
          // Обработка других ошибок
          console.log('Произошла другая ошибка:', error);
        }
      }
      
    case "update":
      try {
        const o_id = id[0]
        var g_id = ""+new ObjectId(o_id)+""
        try {
          if(name !== '' ){
            await Devices.findOneAndUpdate({_id:g_id},{name: name},{new: true});
          }
          if(price !== '' ){        
            await Devices.findOneAndUpdate({_id:g_id},{price: price},{new: true});
          }
          if(image !== '' ){
            await Devices.findOneAndUpdate({_id:g_id},{image: image},{new: true});
          }
          if(about !== '' ){
            await Devices.findOneAndUpdate({_id:g_id},{about: about},{new: true});
          }
          if(category !=='' ){
            await Devices.findOneAndUpdate({_id:g_id},{category: category},{new: true});
        }
        res.send('Устройство обновлено')
        } catch (error) {
          res.send('Ошибка обновления')
        }
      break
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Обработка ошибки истекшего срока действия токена
          console.log('Ошибка: срок действия токена истек.');
        } else {
          // Обработка других ошибок
          console.log('Произошла другая ошибка:', error);
        }
      }
     
    default:
      res.send('Ошибка запроса')
      break
  }
})

router.post('/user/:a', async(req, res) => {
  const {username, token} = req.body
  const action = req.params.a
  switch(action){
      case "data":
        const candidate = await User.findOne({username})
        if( candidate === undefined || candidate === null ){
          const fullArr = {
            Logged: 'false',
          };
          res.send(fullArr)
        }else{
          const basket = await Basket.findOne({username});
          const candidate = await User.findOne({username})
          const name = candidate.username
          const basketQ = basket.device_id.length
          // const basketQ = basket.device_id.length === null ? return 0 : basket.device_id.length
          const {token} = req.body
          const tokenn = jwt.decode(token);
          try {
            const Logged = 'true'
            const role = tokenn.roles[0]
            
            const fullArr = {
              name: name,
              role: role,
              Logged: Logged,
              cart: basketQ
            };
            const UserData = [JSON.stringify(fullArr)]
            const UserArr = [JSON.parse(UserData)]
            if (fullArr) {
            res.send(UserArr)
            }
          } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
            const fullArr = [{'Logged': 'false'}]
              res.send(fullArr)
            } else {
              // обработка других ошибок
            }
            }
          break;
      }  
      case "role":
        console.log(token)
        if(token === null){
          try {
            // res.send('USER')
            break
          } catch (error) {
            break
          }
        }else{
          const tokenn = jwt.decode(token);
            const role = tokenn.roles[0]
            if (role) {
              res.send(role)
              break
            } else {
              res.send('Ошибка')
          }
      }
      case "check":
        try {
          const token = req.headers.authorization.split(' ')[1]
          if (!token) {
            res.send('Logout')
            return res.status(403).json({message: "Пользователь не авторизован"})
          }
          const decodedData = jwt.verify(token, secret)
          req.user = decodedData
      } catch (e) {
        console.log(e)
          res.send('Logout')
      }
      } 
    
  res.end()
})

router.post('/devices/:a', async(req, res) => {

  const {name} = req.body
  const action = req.params.a
  
  switch(action) {
    case "send":
      var o_id =''+name+''
      const devices = schemas.Devices
      const deviceData = await devices.find({category: o_id})
      if (deviceData) {
        res.send(deviceData)
      } else {
        res.send('Ошибка')
      }
      break;
      default:
        res.send('Ошибка запроса')
        break
  }

  res.end()
})

router.post('/product/:a', async(req, res) => {

  const {id} = req.body
  const action = req.params.a
  const descrip = schemas.Descriptions

  switch(action) {
    case "send":
      const candidate = await descrip.findOne({device_id:id}) === undefined ?  [{description:''}] : await descrip.findOne({device_id:id})
      const descripp = candidate.description

      var o_id = ""+new ObjectId(id)+""
      const devices = schemas.Devices
      const findProduct = await devices.find({_id:o_id})
      const name = findProduct[0].toObject()
      const arr = Array.from(descripp) 
      name['desc'] = arr
      const mergedObj = {...name};
      if (mergedObj) {
        res.send([mergedObj])
        break
      } else {
        res.send('Ошибка')
    }
    default:
        res.send('Ошибка запроса')
        break
  }    
  res.end()
})

router.post('/category/:a', async(req, res) => {
  const action = req.params.a
  const {name} = req.body
  
  switch(action) {
    case "send":
      const categoryData = {name: name}
      const newCategory = new schemas.Categories(categoryData)
      const saveCategory = await newCategory.save()
      if (saveCategory) {
        res.send('Категория добавлена')
        break
      } else {
        res.send('Ошибка')
    }
    case "delete":
      const categories = schemas.Categories
      const devices = schemas.Devices
      const deleteCategory = await categories.findOneAndDelete({name: name})
      const deleteFromDevices = await devices.deleteMany({category: name})
      if (deleteFromDevices && deleteCategory) {
        res.send('Категория '+{name}+' удалена')
        break

      } else {
        res.send('Ошибка')
        break
      }
    default:
        res.send('Ошибка запроса')
        break
  }
  res.end()
})

router.post('/product/:id', async(req, res) => {
  const {name} = req.body
  const id = req.params.id
  var o_id = ""+ new ObjectId(id)+""
  const devices = schemas.Devices
  const deviceData = await devices.find({_id:o_id})
  if (deviceData) {
    res.send(JSON.stringify(deviceData))
  }
  res.end()
})

router.post('/devices',async (req, res) => {
  const {name} = req.body
  const devices = schemas.Devices
  if(name === undefined){
    const devicesData = await devices.find({}).exec()
    const Devicers = JSON.stringify(devicesData)
    res.send(Devicers)
  }else{
  const devicesData = await devices.find({category:name}).exec()
  const Devicers = JSON.stringify(devicesData)
  if (devicesData) {
    res.send(Devicers)
  }
  }
  res.end()
})

router.post('/orders',async (req, res) => {
  const {option} = req.body
  if(option === 'New'){
    const devices = schemas.Devices;
      const deviceData = await devices.find({});
      const OrderData = await Orders.find({isCancel:false, isComplete: false})
      
      const deviceNames = OrderData.map(async (element) => {
        const orderID = element._id;
        const nameOfUser = element.username;
        const emailOfUser = element.email;
        const phoneOfUser = element.phone;
        const entryDate = element.entryDate;
        const entryTime = element.entryTime
        const ids = element.device_id;
      
        const Cart = [...new Set(ids)].map((id) => {
          const device = deviceData.find((d) => d.id === id);
          const arr = ids;
          const countMap = arr.reduce((acc, val) => {
            if (val in acc) {
              acc[val]++;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const priceMap = deviceData.reduce((acc, val) => {
            if (val in acc) {
              var o_id = "" + new ObjectId(val) + "";
              acc[val] = devices.find({ _id: o_id }).price;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const countArr = Object.keys(countMap).map((val) => ({
            value: val,
            price: priceMap[val],
            count: countMap[val],
          }));
      
          const countValues = countArr.map((obj) => obj.count);
          const IdValues = countArr.map((obj) => obj.value);
      
          return {
            device_id: id,
            device_data: device,
            count: countValues,
            value: IdValues,
          };
        });
        const countValues = Cart.map((obj) => obj.count);
        const IdValues = Cart.map((obj) => obj.value);
        const GoodCart = JSON.stringify(Cart)
        return {
          
          orderAllData: {
            order_id:orderID,
            username: nameOfUser,
            email: emailOfUser,
            phone: phoneOfUser,
            entryDate:entryDate,
            entryTime:entryTime,
            Order: Cart,
            count: countValues,
            value: IdValues,
            
          },
        };
      });
      
      Promise.all(deviceNames).then((results) => {
        console.log(results);
        res.send(results)
      });
  }
  if(option === 'Completed'){
    const devices = schemas.Devices;
      const deviceData = await devices.find({});
      const OrderData =  await Orders.find({isComplete: true,isCancel: false})
      
      const deviceNames = OrderData.map(async (element) => {
        const orderID = element._id;
        const nameOfUser = element.username;
        const emailOfUser = element.email;
        const phoneOfUser = element.phone;
        const entryDate = element.entryDate;
        const entryTime = element.entryTime
        const ids = element.device_id;
      
        const Cart = [...new Set(ids)].map((id) => {
          const device = deviceData.find((d) => d.id === id);
          const arr = ids;
          const countMap = arr.reduce((acc, val) => {
            if (val in acc) {
              acc[val]++;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const priceMap = deviceData.reduce((acc, val) => {
            if (val in acc) {
              var o_id = "" + new ObjectId(val) + "";
              acc[val] = devices.find({ _id: o_id }).price;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const countArr = Object.keys(countMap).map((val) => ({
            value: val,
            price: priceMap[val],
            count: countMap[val],
          }));
      
          const countValues = countArr.map((obj) => obj.count);
          const IdValues = countArr.map((obj) => obj.value);
      
          return {
            device_id: id,
            device_data: device,
            count: countValues,
            value: IdValues,
          };
        });
        const countValues = Cart.map((obj) => obj.count);
        const IdValues = Cart.map((obj) => obj.value);
        const GoodCart = JSON.stringify(Cart)
        const BestCart = GoodCart.slice(1,-1)
        const GreatCart = JSON.parse(GoodCart)
        return {
          
          orderAllData: {
            order_id:orderID,
            username: nameOfUser,
            email: emailOfUser,
            phone: phoneOfUser,
            entryDate:entryDate,
            entryTime:entryTime,
            Order: Cart,
            count: countValues,
            value: IdValues,
            
          },
        };
      });
      
      Promise.all(deviceNames).then((results) => {
        console.log(results);
        res.send(results)
      });
  }
  if(option === 'Canceled'){
    const devices = schemas.Devices;
      const deviceData = await devices.find({});
      const OrderData = await Orders.find({isCancel: true})
      
      const deviceNames = OrderData.map(async (element) => {
        const orderID = element._id;
        const nameOfUser = element.username;
        const emailOfUser = element.email;
        const phoneOfUser = element.phone;
        const entryDate = element.entryDate;
        const entryTime = element.entryTime
        const ids = element.device_id;
      
        const Cart = [...new Set(ids)].map((id) => {
          const device = deviceData.find((d) => d.id === id);
          const arr = ids;
          const countMap = arr.reduce((acc, val) => {
            if (val in acc) {
              acc[val]++;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const priceMap = deviceData.reduce((acc, val) => {
            if (val in acc) {
              var o_id = "" + new ObjectId(val) + "";
              acc[val] = devices.find({ _id: o_id }).price;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {});
      
          const countArr = Object.keys(countMap).map((val) => ({
            value: val,
            price: priceMap[val],
            count: countMap[val],
          }));
      
          const countValues = countArr.map((obj) => obj.count);
          const IdValues = countArr.map((obj) => obj.value);
      
          return {
            device_id: id,
            device_data: device,
            count: countValues,
            value: IdValues,
          };
        });
        const countValues = Cart.map((obj) => obj.count);
        const IdValues = Cart.map((obj) => obj.value);
        const GoodCart = JSON.stringify(Cart)
        const BestCart = GoodCart.slice(1,-1)
        const GreatCart = JSON.parse(GoodCart)
        return {
          
          orderAllData: {
            order_id:orderID,
            username: nameOfUser,
            email: emailOfUser,
            phone: phoneOfUser,
            entryDate:entryDate,
            entryTime:entryTime,
            Order: Cart,
            count: countValues,
            value: IdValues,
            
          },
        };
      });
      
      Promise.all(deviceNames).then((results) => {
        console.log(results);
        res.send(results)
      });
  }
})

router.post('/category/:id', async(req, res) => {
  const {name} = req.body
  const id = req.params.id
  var o_id = ""+ new ObjectId(id)+""
    const devices = schemas.Devices
    const deviceData = await devices.find({_id:o_id})
    if (deviceData) {
      res.send(JSON.stringify(deviceData))
    }
    res.end()
})
router.get('/categories', async (req, res) => {
  const categories = schemas.Categories
  const CategoryData = await categories.find({}).exec()
  if (CategoryData) {
    res.send(JSON.stringify(CategoryData))
  }
})

module.exports = router