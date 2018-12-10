const Token = require('./models/Token');
var cron = require('node-cron');

// ttl for blocked token
const clientTTLInSeconds = 60;
// ttl for unblocked token
const adminTTLInSeconds = 5 * 60;

exports.start = async () => {
  console.log('Cron job started')
  cron.schedule('5 * * * * *', () => {
    run()
  });
}

const run = async ()=>{
  await refreshExpiredClientTokens()
  await removeExpiredTokens()
}

const removeExpiredTokens = async () =>
  Token.deleteMany({
    updatedAt: {
      $lt: (new Date(Date.now() - (adminTTLInSeconds * 1000)))
    }
  }).catch(err=>console.error(err))

const refreshExpiredClientTokens = async () => Token.findOneAndUpdate({
  isBlocked: true,
  updatedAt: {
    $gt: (Date.now() - (adminTTLInSeconds * 1000)),
    $lt: (Date.now() - (clientTTLInSeconds * 1000))
  }
}, {
  isBlocked: false
}).catch(err => console.error(err))