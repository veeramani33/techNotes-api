const { format } = require('date-fns')
const path = require('path')
const fs = require('fs')
const fsPromises =  require('fs').promises
const { v4 : uuid} = require('uuid')

const logEvents = async ( message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = (`${dateTime}\t${uuid()}\t${message}\n`);

    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))){
        fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
}

const logger = (req, res, next) =>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    next();
}

module.exports = {logger, logEvents};