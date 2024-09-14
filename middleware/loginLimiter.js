const  rateLimiter = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimiter({
    windowMs: 60 * 1000, //1 minute
    max: 5, // maximum 5 login allowed for one IP address per minute
    message:{
        message: 'Too many login attempts from this IP, Please try after some time'
    },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the RateLimit - headers
    legacyHeaders: false, // Disable the X-RateLimit headers
})

module.exports = loginLimiter