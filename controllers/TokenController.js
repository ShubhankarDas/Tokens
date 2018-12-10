const shortid = require('shortid');
const Token = require('../models/Token');

// ttl for blocked token
const clientTTLInSeconds = 60;
// ttl for unblocked token
const adminTTLInSeconds = 5 * 60;

// Generate new token
exports.generateToken = async (req, res, next) => {
  const randomKey = shortid.generate();
  const newToken = new Token();
  newToken.tokenKey = randomKey;
  newToken.blocked = false;
  newToken.save();
  res.send(randomKey);
};

// get free token
const getFreeToken = () =>
// find token from the unBlocked bucket
  Token.findOneAndUpdate(
    {
      isBlocked: false,
      updatedAt: {
        $gt: (new Date(Date.now() - (adminTTLInSeconds * 1000)))
      }
    },
    {
      isBlocked: true
    }
  ).then(token => {
    if(!token){
      return Token.findOneAndUpdate({
        isBlocked: true,
        updatedAt: {
          $gt: (Date.now() - (adminTTLInSeconds * 1000)),
          $lt: (Date.now() - (clientTTLInSeconds * 1000))
        }
      }, {
        isBlocked: true
      })
    }
    return token
  });

// Assign a free token
exports.assignToken = async (req, res, next) => {
  getFreeToken()
  .then(token =>{
    if(token)
      res.send(token)
    else
      res.send('No token available')
  })
  .catch(err => res.send('No token available'))
};

// Unblock a token
exports.unblockToken = async (req, res, next) =>
  Token.findOneAndUpdate({
    tokenKey: req.params.token,
    updatedAt: {
      $gt: (Date.now() - (adminTTLInSeconds * 1000))
    }
  }, {
    isBlocked: false
  })
  .then(token => res.send(token ? `${token.tokenKey} is now free` : 'invalid token'))


// delete a token
exports.deleteToken = async (req, res, next) =>
  Token.remove({
    tokenKey: req.params.token,
  })
  .then(() => res.send('Token has been removed'))

// refresh a token
exports.refreshToken = async (req, res, next) => {
  if (!req.params.admin || !req.params.token) {
    return res.send('invalid token or params');
  }
  Token.findOne({
    tokenKey: req.params.token
  }).then(token => {
    if (token) {
      if (req.params.admin === '0') {
        if (
          token.isBlocked &&
          (Date.now() - token.updatedAt) / 1000 < clientTTLInSeconds
        ) {
          token.updatedAt = new Date();
          token.save();
          res.send(`${token.tokenKey} has been refreshed`);
        } else {
          res.send('Your token has expired');
        }
      } else {
        let updatedAtDiff = (Date.now() - token.updatedAt) / 1000;
        if (token.isBlocked) {
          if (
            updatedAtDiff > clientTTLInSeconds &&
            updatedAtDiff < adminTTLInSeconds
          ) {
            token.isBlocked = false
            token.updatedAt = new Date();
            token.save();
            res.send(`${token.tokenKey} has been refreshed`);
          } else {
            res.send('The token is not free');
          }
        } else if (updatedAtDiff < adminTTLInSeconds) {
          token.isBlocked = false
          token.updatedAt = new Date();
          token.save();
          res.send(`${token.tokenKey} has been refreshed`);
        }
      }
    }
    res.send('Invalid token id')
  });
};

// get all tokens
exports.getAllTokens = async (req, res, next) => {
  Token.find(
    {},
    {
      tokenKey: 1,
      isBlocked: 1
    }
  )
    .then(tokens => {
      if (tokens && tokens.length > 0) {
        res.send(tokens);
      } else {
        res.send('No tokens found');
      }
    })
    .catch(err => {
      res.send('No tokens found');
      console.error(err);
    });
};
