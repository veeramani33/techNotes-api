const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc login
// @router POST / auth
// @access Public
const login = async(req, res) => {
    const { username, password } = req.body

    if(!username || !password){
       return res.status(400).json({message: "All fields are required"})
    }

    const foundUser = await User.findOne({username}).exec()

    if(!foundUser || !foundUser.active){
        return res.status(401).json({message: "Unauthorized"})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match){
        return res.status(401).json({message:'Unauthorized'})
    }

    const accessToken = jwt.sign(
        {
            "UserInfo":{
                "username": foundUser.username,
                "roles": foundUser.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        {"username": foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    //create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web browser
        secure: true, //https
        sameSite: 'None',//cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to refresh token
    })

    //Send access token containing  username and roles
    res.json({accessToken})
}

// @desc Refresh
// @route Get/Auth/Refresh
// @access Public - because access token has expired 
const refresh = ( req, res ) => {
    const cookie = req.cookies

    if(!cookie.jwt) return res.status(401).json({message: 'Unathorized '})

    const refreshToken = cookie.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async(err, decoded)=>{
            if(err) return res.status(403).json({message:"Forbidden"})
            
            const foundUser = await User.findOne({username: decoded.username}).exec()
            if(!foundUser) return res.status(401).json({message: "Unauthorized 2"})

            const accessToken = jwt.sign(
                {
                    "UserInfo":{
                        "username": foundUser.username,
                        "roles": foundUser.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m'}
            )
            res.json({accessToken})
        })
}

// @desc logout
// @route POST/Auth/Logout
// @access Public - just to clear cookies if exist
const logout = (req, res) =>{
    const cookie = req.cookies
    if(!cookie?.jwt) return res.sendStatus(204) // No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure:true})
    res.json({message: 'Cookies cleared'})
}

module.exports = {
    login,
    refresh,
    logout
}