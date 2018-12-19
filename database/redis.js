const constants = require('./constants')

const generateKey = (type, key) => `${type}_${key}`
// keep a set of free pool in ram for quick fetch
let free_pool = []

// get free tokens from redis
const getFreeTokensFromMaster = async (client) =>
  client.keysAsync('*').then(keys => {
    const freeKeys = {}
    keys.forEach(key => {
      let i = key.indexOf('_')
      const token = key.slice(i + 1)
      if (freeKeys[token]) {
        delete freeKeys[token]
      } else {
        freeKeys[token] = true
      }
    })
    return Object.keys(freeKeys)
  })

// get free tokens from ram first
const getFreeTokensFromLocal =  async (client) => {
  // if local pool is empty then update from redis
  if (free_pool.length < 1) {
    const keys = await getFreeTokensFromMaster(client)
    free_pool = free_pool.concat(keys)
  }
  if (free_pool.length > 0) {
    const token = free_pool.pop()
    // check if the token is available
    if (await exports.isAvailable(constants.MASTER, token, client)) {
      return token
    }
    // fetch another token if token is not available
    return getFreeTokensFromLocal(client)
  }
  // if there are no free tokens
  return null
}

// Check if the token is available for a given state(type)
exports.isAvailable = async (type, token, client) =>
  client.getAsync(generateKey(type, token))

// add and update free token
exports.addOrUpdateFreeToken = async (token, client) =>
  client.setexAsync(generateKey(constants.MASTER, token), constants.adminTTLInSeconds, token)
    .then(() => {
      // fill local pool while updating
      free_pool.includes(token) ? '' : free_pool.push(token)
      return token
    })

// add and update assigned token
exports.addOrUpdateAssignedToken = async (token, client) =>
  client.setexAsync(generateKey(constants.MASTER, token), constants.ttlInSecondsWithBuffer, token)
  .then(() => {
    client.setexAsync(generateKey(constants.ASSIGNED, token), constants.clientTTLInSeconds, token)
    return token
  })

// get free token
exports.getFreeToken = async (client) => {
  const token = await getFreeTokensFromLocal(client)
  return token
}

// Remove token
exports.removeToken = async(client, token) => {
  if(await exports.isAvailable(constants.ASSIGNED, token, client)){
    return false
  }
  free_pool = free_pool.splice(free_pool.indexOf(token),1)
  await client.delAsync(generateKey(constants.MASTER, token))
  return true
}

// unblock token
exports.unblockToken = async (client, token) => {
  if (await exports.isAvailable(constants.MASTER, token, client)) {
    await client.delAsync(generateKey(constants.ASSIGNED, token))
    await exports.addOrUpdateFreeToken(token, client)
    return token
  }
}

// refresh free token
exports.refreshFreeToken = async (client, token) => {
  if (await exports.isAvailable(constants.MASTER, token, client)) {
    return await exports.addOrUpdateFreeToken(token, client)
  }
}

// refresh assigned token
exports.refreshAssignedToken = async (client, token) => {
  if (await exports.isAvailable(constants.ASSIGNED, token, client)) {
    return await exports.addOrUpdateAssignedToken(token, client)
  }
}