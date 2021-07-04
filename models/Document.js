const mongoose=require('mongoose')
const Document=new mongoose.Schema({
    data:{
        type:Object,
    },
    title:{
        type:String,
        required:true
    },
    editLink:{
        type:String,
        required:true
    },
    viewLink:{
        type:String,
        required:true
    },
},
{timestamps:true}
)

module.exports=mongoose.model('Document',Document)