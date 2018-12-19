const express = require('express')
const bluebird = require('bluebird')
const dotenv = require('dotenv')
const cron = require('./cron')
const redis = require('redis')
// Controllers
const tokenController = require('./controllers/TokenController')

// load environment variables
dotenv.load({
  path: '.env'
});

// Convert redis to promises
bluebird.promisifyAll(redis);
// Create redis client
let client = redis.createClient()
client.on('connect', ()=>{
  console.log('Connected to redis')
  // for starting with a fresh redis
  // client.flushall()
  // console.log('Redis flushed')
})

// set port
const port = process.env.PORT || 3000

// Init APP
const app = express()

// app.get('/tokens', tokenController.getAllTokens)

const middleware = (req,res,next) => {
  req.client = client;
  next()
}

app.get('/token/generate', middleware, tokenController.generateToken)
app.get('/token/assign', middleware, tokenController.assignToken)
app.get('/token/:token/unblock', middleware, tokenController.unblockToken)
app.get('/token/:token/delete', middleware, tokenController.deleteToken)
app.get('/token/:token/refresh/:admin', middleware, tokenController.refreshToken)

app.listen(port,()=>{
  console.log(`listening on port - ${port}...`)
})

// Start cron for refreshing tokens from blocked to unblocked and delete expired tokens
cron.start()