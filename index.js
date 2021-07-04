const express=require('express')
const http=require('http')
const cors=require('cors')
const socketio=require('socket.io')
const cookieParser=require('cookie-parser')
const session=require('express-session') 
const mongoose=require('mongoose')
const route=require('./Routes/route')
const Document=require('./models/Document')
const User=require('./models/User')
const methodOverride=require('method-override')
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utilities/users')
require('dotenv/config')

const PORT=5000
const app=express()
const server=http.createServer(app)
const io=socketio(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST","PUT","DELETE"],
        credentials:true
    }
})

app.use(methodOverride('_method'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:"http://localhost:3000",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
})) 

app.use(cookieParser())
app.use(session({
    key: "userId",
    secret:"google-docs",
    resave:true,
    saveUninitialized:true,
    cookie:{
        // expires: 60*60*5
        maxAge: 60*60*24*1000
    }
}))

app.use('/',route)

mongoose.connect(process.env.URI,{ useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false,useCreateIndex:true} ,(err)=>{
    if(err)
        console.log(err)
    else
        console.log('connected to db')   
})

const defaultDocument=""

io.on('connection',(socket)=>{
    console.log('connected')

    socket.on('get-document',async (documentId,currUser)=>{
        socket.join(documentId)
        // console.log(documentId,currUser)
        userJoin(socket.id,currUser.email,currUser.name,documentId)
        io.to(documentId).emit('getActiveUser',getRoomUsers(documentId))
        
        const document=await findOrCreate(documentId)
        socket.emit('load-document',document)

        socket.on('send-change',(delta)=>{
            // console.log('inside send cange')
            socket.broadcast.to(documentId).emit('recieve-change',delta)
        })

        socket.on('givePossession',async()=>{
            await givePossess(documentId,currUser)
            socket.emit('givenPossession','given')
        })

        socket.on('giveCollab',async()=>{
            const users=await findCollab(documentId)
            socket.emit('recieveCollab',users)
        })

        socket.on('save-document',async (data)=>{
            await updateDoc(data,documentId)
        }) 
        
        socket.on('increaseTime',async()=>{
            await updateTime(documentId,currUser)
        })
    })

      

    socket.on('disconnect',()=>{
        const userLeft=userLeave(socket.id)
        // console.log(userLeft)
        io.to(userLeft.documentId).emit('getActiveUser',getRoomUsers(userLeft.documentId))
        console.log('disconnected') 
    })
})


const findOrCreate=async(documentId)=>{
    const document=await Document.findById(documentId)
    if(document){
        // console.log(document)
        return document
    }
    return 'notFound'
    
}

const updateDoc=async (data,documentId)=>{
    await Document.findByIdAndUpdate(documentId,{data})
    // console.log(upd)
}

const givePossess=async(documentId,currUser)=>{
    const user=await User.findById(currUser._id)
    const index=user.possessDoc.findIndex((doc)=>{
        
        return doc.docId.toString()===documentId
    })
    if(index===-1){
        user.possessDoc.push({docId:documentId})
        await user.save() 
    }

}

const findCollab=async(documentId)=>{
    const users=User.find({possessDoc:{$elemMatch:{'docId':documentId}}})
    return users
}


const updateTime=async(documentId,currUser)=>{
    const user=await User.findById(currUser._id)
    const index=user.possessDoc.findIndex((doc)=>{ 
        return doc.docId.toString()===documentId
    })
    if(index!==-1){
        user.possessDoc[index].time+=1
    }
    await user.save()
}

// const PORT2=5001
server.listen(PORT,()=>console.log(`listening on port ${PORT}`))
