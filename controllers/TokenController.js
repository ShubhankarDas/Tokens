const shortid = require('shortid');
const Token = require('../models/Token');
const constants = require('../database/constants')
const db = require('../database/redis')

// Generate new token
exports.generateToken = async (req, res, next) => {
  const newToken = await db.addOrUpdateFreeToken(shortid.generate(), req.client)
  res.send(newToken);
};

// Assign a free token
exports.assignToken = async (req, res, next) => {
  try {

    const token = await db.getFreeToken(req.client)

    if(token){
      await db.addOrUpdateAssignedToken(token, req.client)
      res.send(token)
    }
    else
      res.status(404).send('No token available.')
  }
  catch(err) {
    console.log(err)
    res.status(500).send(`Something went wrong.`)
  }
}

// Unblock a token
exports.unblockToken = async (req, res, next) => {
  try{
  const token = await db.unblockToken(req.client, req.params.token)

  if(token)
    res.send(`${token} is now free.`)
  else
    res.status(404).send(`Invalid token id`)
  } catch (err) {
    console.log(err)
    res.status(500).send(`Something went wrong.`)
  }
}


// delete a token
exports.deleteToken = async (req, res, next) =>{
  try{
    if(await db.removeToken(req.client, req.params.token)){
      return res.send('Token has been removed.')
    }
    res.send('Token is not free.')
  }
  catch (err) {
    console.log(err)
    res.status(500).send(`Something went wrong.`)
  }
}

// refresh a token
exports.refreshToken = async (req, res, next) => {

  const {token, admin} = req.params
  const client = req.client

  if (!admin || !token) {
    return res.send('Invalid token or params.');
  }
  if (admin === '0') {
    if(await db.isAvailable(constants.ASSIGNED, token, client)){
      await db.addOrUpdateAssignedToken(token, client)
      res.send(`${token} has been updated.`)
    }else{
      res.send(`Your token has expired.`)
    }
  }else{
    if (await db.isAvailable(constants.MASTER, token, client)) {
      if (await db.isAvailable(constants.ASSIGNED, token, client)) {
        res.send(`Token is not free.`)
      }else{
        await db.addOrUpdateFreeToken(token, client)
        res.send(`${token} has been updated.`)
      }
    } else {
      res.send(`Invalid token.`)
    }
  }
};