# Tokens

A server which can generate and assign random tokens within a pool and release
them after some time.<br/><br/>


## Endpoints
GET - /token/generate - creates and returns a new token.<br />
GET - /token/assign - Assigns a free token from the pool (This token will be blocked for others).<br />
GET - /token/:token/unblock - Frees a blocked token. Takes tokenId as param.<br />
GET - /token/:token/delete - Deletes a token from the pool irrespective of its state(blocked/free). Takes tokenId as param.<br />
GET - /token/:token/refresh/:admin - Keep-alive call for the tokens. Takes tokenId and admin(0/1) as param. 0 - client 1 - admin<br />

## Dev Stack
- <b>Express</b> for creating the server structure 
- <b>Redis</b> for accessing redis
- <b>Bluebird</b> for converting all the mongoose calls into promises 
- <b>Node-cron</b> for scheduling a cron job
