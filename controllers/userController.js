const bcrypt = require('bcrypt')
const User = require('../models/User');
const Note = require('../models/Note')

const  getAllUsers = async(req, res)=>{
    const result= await User.find().select('-password').lean()
    if(!result?.length){
        return res.status(400).json({message:'No Users Found'});
    }
    res.json(result);
}

const createNewUser = async(req, res)=>{
    const {username, password, role} = req.body
    if(!username || !password ){
       return res.status(400).json({message: 'All fields are required'})
    }
    const duplicate = await User.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec();
    if(duplicate){
        return res.status(409).json({message:'Username already exists'})
    }
    //hashedPassword
    const hashedPwd = await bcrypt.hash(password, 10)
    
    const userObject = (!Array.isArray(role) || !role.length) ? {username, "password": hashedPwd} : {username, "password": hashedPwd, "role": role}

    const result = await User.create(userObject);
    if(result){
        res.status(201).json({message: `New User ${result} created`})
    }else{
        res.status(400).json({message: 'Invalid User data'})
    }
}

const updateUser = async (req, res)=>{
    const {id, username, password, role, active} = req.body;
    //|| !Array.isArray(role) || !role.length || typeof active !== 'boolean'
    
    if (!id || !username || !Array.isArray(role) || !role.length || typeof active !== 'boolean' ) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }
    
    const userData = await User.findById(id).exec();
    
    if(!userData) {
        return res.status(400).json({ message:'User not found' });
    }
    
    const duplicate = await User.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({message:`usename ${username} already exists`})
    }
     
    userData.username = username;
    userData.role = role;
    userData.active = active;

    if(password){
        const hashPwd = await bcrypt.hash(password, 10);
        userData.password = hashPwd;
    }

    const updateUser = userData.save()
    res.json({ message: `${updateUser.username} updated` })
}

const deleteUser = async(req, res)=>{
    const { id } = req.body;
    if (!id){
        return res.status(400).json({message: "User ID required"})
    }
    const findUser = await User.findById(id).exec();
    
    if(!findUser){
        return res.status(400).json({message:'User Not Exists'})
    }
    const active = findUser.active;
    if(active){
        const noteUser = await Note.findOne({user: id});
        if(noteUser){
            return res.status(400).json({message: `User ${findUser.username} has assigned notes`})
        }
    }
    const result = await findUser.deleteOne()
    res.json(`User ${findUser.username} Deleted`);
}

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }