var users=[]

function userJoin(id,email,name,documentId){
    const user={id,email,name,documentId}
    
    users.push(user)
    // return user
}

//get current user
function getCurrentUser(id)
{
    const user1= users.find(user=>{ return user.id===id })
    return user1
}

//when user leaves 
function userLeave(id){
    const index=users.findIndex(user=>{return user.id===id})
    // console.log(users)
    // console.log(index)
    if(index!==-1) 
    {
        return users.splice(index,1)[0]
    }
}

//get room users
function getRoomUsers(documentId)
{
    return users.filter(user=>{return user.documentId===documentId})
}

module.exports={
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}