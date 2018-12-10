const express = require('express')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const dotenv = require('dotenv')
// const redis = require('redis')

// Controllers
const tokenController = require('./controllers/TokenController')

// load environment variables
dotenv.load({
  path: '.env'
});

// // Convert redis to promises
// bluebird.promisifyAll(redis);

// // Create redis client
// let client = redis.createClient()
// client.on('connect', ()=>{
//   console.log('Connected to redis')
// })

// set port
const port = process.env.PORT || 3000

// Init APP
const app = express()

/**
 * Connect to MongoDB.
 */
mongoose.Promise = bluebird;
mongoose.connect(
  process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true
  }
)

mongoose.connection.on('connected', () => {
  console.log('connected to mongo server.')
})

mongoose.connection.on('error', (err) => {
  console.log('error connection to mongo server!')
})

// app.get('/tokens', tokenController.getAllTokens)

app.get('/token/generate', tokenController.generateToken)
app.get('/token/assign', tokenController.assignToken)
app.get('/token/:token/unblock', tokenController.unblockToken)
app.get('/token/:token/delete', tokenController.deleteToken)
app.get('/token/:token/refresh/:admin', tokenController.refreshToken)

app.listen(port,()=>{
  console.log(`listening on port - ${port}...`)
})