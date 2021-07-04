const mongoose=require('mongoose')
const Document=require('./Document')

const possess=new mongoose.Schema({
    docId:{
        type:mongoose.Types.ObjectId,
        ref:"Document"
    },
    time:{
        type:Number,
        default:0
    }
})


const User=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        required:true
    },
    possessDoc:{
        type:[possess]
    }
})


module.exports=mongoose.model('User',User)