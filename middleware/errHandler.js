const {logEvents} = require('./logger')

const errHandler = (err, req, res, next) => {
    logEvents(`${err.name}:${err.messgage}\t${req.name}\t${req.method}\t${req.headers.origin}`, 'errLog.log');
    console.log(err.stack);
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status);
    res.json({ message: err.message, isError: true });
}

module.exports = errHandler;