module.exports = {
  MASTER: 'master',
  ASSIGNED: 'assigned',
  clientTTLInSeconds: 60, // ttl for blocked token
  adminTTLInSeconds: 5 * 60, // ttl for unblocked token
  ttlInSecondsWithBuffer: 60 + (5*60)
}