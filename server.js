require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
const  { logger, logEvents } = require('./middleware/logger')
const errHandler = require('./middleware/errHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3500;

connectDB();


app.use(logger);

app.use(cookieParser());

app.use(express.json());

app.use(cors(corsOptions));

app.use('/', express.static(path.join(__dirname,'public')))

//routes
app.use('/', require('./routes/roots'))
app.use('/auth', require('./routes/auth'))
app.use('/user', require('./routes/user'))
app.use('/note', require('./routes/note'))

app.all('*',(req, res)=>{
    res.status(404)
    if(req.accepts('.html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }else if(req.accepts('json')){
        res.json({message:   'Not Found 404'});
    }else{
        res.type('txt').send('Not Found 404');
    }
})

app.use(errHandler);

mongoose.connection.once('open', ()=>{
    console.log('DB Connection Established');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
})

mongoose.connection.on('error', err =>{
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErr.log')
})
