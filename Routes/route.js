const express=require('express')
const route=express.Router()
const bcrypt=require('bcrypt')
const Document=require('../models/Document')
const User=require('../models/User')
const {v4 : uuidv4} = require('uuid')
const url = require('url');


route.get('/allusers',(req,res)=>{
    User.find()
    .populate("possessDoc.docId","_id title createdAt updatedAt editLink")
    .then(users=>{
        res.json({users})
    })
    .catch(err=>console.log(err))
})

route.post('/newdoc',async(req,res)=>{
    const defaultDocument=""
    // const newid=uuidv4()
    const edit=uuidv4()
    const newDoc = new Document({
    //   _id: newid,
      title:req.body.title,
      data: defaultDocument,
      editLink:edit,
      viewLink:uuidv4()
    });
    const newdocument=await newDoc.save();
    console.log(newdocument)
    res.redirect(`http://localhost:3000/documents/${newdocument._id}?sharing=${edit}`)
})

route.get('/dashboarduser/:userid',(req,res)=>{
    User.findOne({_id:req.params.userid})
    .populate("possessDoc.docId","_id title createdAt updatedAt editLink")
    .then(user=>{
        if(user)
            res.json({user})
        else
            res.json({msg:"user do not not exist"})
    })
    .catch(err=>console.log(err))
})


route.post("/signup",(req,res)=>{
    const password=req.body.pass
    bcrypt.hash(password,10,(err,hash)=>{
        if(err)
        {
            console.log(err)
            res.json({msg:"Error occured"})
        }
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:hash,
            isAdmin:false
        })
        user.save()
        .then(savedUser=>{
            // console.log(savedUser)
            res.status(200).json({msg:"Signed up successfully, Now you can Login!"})
        })
        .catch(error=>{
            res.json({msg:"User already exists"})
        })
        
    })
})


route.post("/login",(req,res)=>{
    // console.log(req.body)
    const admin=req.body.role==='admin'?true:false
    User.findOne({$and:[{email:req.body.email2},{isAdmin:admin}]})
    .then(userfound=>{
        if(userfound){
            bcrypt.compare(req.body.password2,userfound.password,(error,response)=>{
                if(response)
                {
                    req.session.user=userfound
                    // res.json({info:userfound,msge:'login done'})
                    res.redirect(url.format({pathname:"http://localhost:3000",state:'state login succss'}))
                }
                else
                { 
                    // res.json({msg:"Wrong email & password combination"})
                    res.redirect("http://localhost:3000?msg=Wrong+email+and+password+combination")
                }
            })
        }
        else{
            // res.json({msg:"User Email do not exist"})

            res.redirect('http://localhost:3000?msg=User+Email+do+not+exist')
        }
    })
    .catch(err=>console.log(err))
    
})

route.get("/login",(req,res)=>{
    if(req.session.user)
    {
        res.json({loggedin:true,user:req.session.user})
    }
    else
    {
        res.json({loggedin:false})
    }
})


route.get("/logout",(req,res)=>{
    if(req.session.user)
    {
        req.session.user=null
        res.redirect("http://localhost:3000/")
    }
    else
    {
        res.redirect("http://localhost:3000/")
    }
})


route.delete('/deleteDoc/:documentId/:userId',async(req,res)=>{
    if(req.session.user){
        const {documentId,userId}=req.params
        const path=req.query.path
        const userfound=await User.findById(userId)
        const index=userfound.possessDoc.findIndex((doc)=>{
            return doc.docId.toString()===documentId
        })
        if(index!==-1){
            userfound.possessDoc.splice(index,1)
            await userfound.save()
        }

        res.redirect(`http://localhost:3000/${path}`)
        
    }
})

module.exports=route