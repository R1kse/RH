const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const authRouter = require('./authRouter')
const crypto = require('crypto')
require('dotenv/config')

const app =  express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use('/', router)
app.use("/auth", authRouter)
const dbOptions = {useNewUrlParser:true, useUnifiedTopology:true}
mongoose.connect(process.env.DB_URI, dbOptions)
.then(() => console.log('DB Connected!'))
.catch(err => console.log(err))
 
const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
