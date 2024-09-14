const Notes = require('../models/Note')
const User = require('../models/User')

const getAllNotes = async(req, res)=>{
    const result = await Notes.find().lean();
    if(!result?.length){
       return res.status(409).json({message:"Notes not found"})
    }
    const notes =  await Promise.all(result.map(async(note)=>{
        const user = await User.findById(note.user).lean().exec();
        return {...note, username: user.username}
    }))
    res.json(notes);
}

const createNewNote = async(req, res)=>{
    const {user, title, text} = req.body;
    if(!user || !title || !text ){
        return res.status(400).json({message:"all fields are required"});
    }
    const duplicate = await Notes.findOne({title}).collation({ locale: 'en', strength: 2 }).lean().exec();
    if(duplicate){
        return res.status(409).json({message:`title ${title} already exists`});
    }
    const dupUser = await User.findById(user).lean().exec();
    if(!dupUser){
        return res.status(409).json({message:`${user} doesn't exists in user list`});
    }
    const result = await Notes.create({user, title, text});
    if(result){
        res.status(201).json({result})
    } else{
        res.status(400).json({message:"Received wrong data"})
    }
}

const updateNote = async(req, res)=>{
    const { id, user, title, text, completed } = req.body

    if(!id || !user || !title || !text || typeof(completed) !== 'boolean'){
        return res.status(400).json({message: "all fields are required"});
    }
    const note = await Notes.findById(id).exec();
    if(!note){
        return tes.staus(409).json({message: "Notes not found"});
    }
    const duplicate = await Notes.findOne({title}).collation({ locale: 'en', strength: 2 }).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id ){
       return res.status(409).json({message: `${title} already exists`})
    }
    const dupUser = await User.findById(user).exec();
    if(!dupUser){
        return res.status(409).json({message:`${user} doesn't exists in user list`});
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;
    const result = await note.save()
    res.json(`'${note.title}' Updated Successfully`)
}

const deleteNote = async(req, res)=>{
    const { id } = req.body;
    const findId = await Notes.findById(id).exec();
    if(!id || !findId){
        return res.status(409).json({message: "Note ID not found"})
    }
    const result = await findId.deleteOne();
    res.json(`'${findId.title}' Deleted Successfully`)
}

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };