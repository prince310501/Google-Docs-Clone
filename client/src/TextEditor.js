import React,{useState,useEffect,useRef,useCallback} from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {io} from 'socket.io-client'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Form, FormGroup,ListGroup,ListGroupItem } from 'reactstrap'
import queryString from 'query-string'
import axios from 'axios'
axios.defaults.withCredentials=true

const TOOLBAR=[
    [{header: [1,2,3,4,5,6,false]}],
    [{ font: [] }],
    [{ list: 'ordered'}, { list: 'bullet' }],
    ['bold', 'italic', 'underline', 'strike'],       
    [{ color: [] }, { background: [] }],            
    [{ script: 'sub'}, { script: 'super' }],      
    [{ 'indent': '-1'}, { 'indent': '+1' }],       
    [{ align: [] }],
    ['image','blockquote', 'code-block'],
    ['clean']   // remove formatting button
  ];
const SAVE_TIME=2000


const TextEditor = (props) => {
    const {sharing}=queryString.parse(props.location.search)
    if(sharing===null || sharing ===undefined){
        props.history.push({pathname:'/',state:'No such link exist'})
    }
    const[socket,setSocket]=useState()
    const[quill,setQuill]=useState()
    const[doc,setDoc]=useState(null)
    const[canEdit,setCanEdit]=useState(null)
    const[activeUsers,setActiveUsers]=useState(null)
    const[collaborators,setCollaborators]=useState(null)
    const documentId=props.match.params.id
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [modal1, setModal1] = useState(false);
    const toggle1 = () => setModal1(!modal1);

    const handleBack=()=>{
        props.history.goBack()
    }
    
    const[currUser,setCurrUser]=useState(null)
    useEffect(() => {
        if(props.history===null)
            return
        axios.get('http://localhost:5000/login')
        .then(res=>{
            if(res.data.loggedin===true){
                setCurrUser(res.data.user)
            }
            else{
                props.history.push('/')
            }
        })
        .catch(err=>console.log(err))
        return ()=>{
            setCurrUser(null)
        }
    }, [])

    // console.log('1')
    useEffect(() => {
        const s=io("http://localhost:5000")
        // console.log('2')
        setSocket(s)
        return () => {
            s.disconnect()
        }
    }, [])

    
    useEffect(() => {
        // console.log('2');
        if(socket==null || quill==null)
            return
        quill.on("text-change",(delta,oldDelta,source)=>{
            if (source !== 'user') {
                return
                // console.log("A user action triggered this change.");
            }
            socket.emit('send-change',delta)
        })
        
        return () => {
            quill.off("text-change",(delta,oldDelta,source)=>{
                socket.emit('send-change',delta)
            })
            
        }
    }, [socket,quill])

    
    
    useEffect(() => {
        // console.log('4')
        if(socket==null || quill==null)
            return
        socket.on("recieve-change",(delta)=>{
            
            quill.updateContents(delta)
        })
        return () => {
            socket.off("recieve-change",(delta)=>{
                quill.updateContents(delta)
            })
        }
    }, [socket,quill])
    //2

    useEffect(()=>{
        if(socket==null || quill==null || props.history===null || documentId===null || currUser==null)
            return

        socket.emit('get-document',documentId,currUser)
        
        socket.on('getActiveUser',(users)=>{
            setActiveUsers(users)
        })

        socket.on('load-document',document=>{
            if(document!=='notFound'){
                quill.setContents(document.data)
                setDoc(document)
                if(document.editLink===sharing){
                    setCanEdit(1)
                }
                else if(document.viewLink===sharing){
                    setCanEdit(0)
                }
                else{
                    // setCanEdit(-1)
                    props.history.push({pathname:'/',state:'No such link exist'})
                }
                // quill.enable()
            }
            else{
                props.history.push({to:'/',state:'document do not exist'})
            }
            
        })

        return ()=>{
            socket.off('load-document',document=>{
                if(document!=='notFound'){
                    quill.setContents(document.data)
                    setDoc(document)
                    if(document.editLink===sharing){
                        setCanEdit(1)
                    }
                    else if(document.viewLink===sharing){
                        setCanEdit(0)
                    }
                    else{
                        // setCanEdit(-1)
                        props.history.push({pathname:'/',state:'No such link exist'})
                    }
                    // quill.enable()
                }
                else{
                    props.history.push({to:'/',state:'document do not exist'})
                }
                
            })

            socket.off('getActiveUser',(users)=>{
                setActiveUsers(users)
            })
        }


    },[socket,quill,documentId,sharing,currUser])

    useEffect(()=>{
        if(socket==null || quill==null || canEdit==null)
            return
        if(canEdit===1){
            socket.emit('givePossession')
            socket.on('givenPossession',response=>{
                if(response==='given'){
                    document.getElementById('collab').addEventListener('click',()=>{
                        socket.emit('giveCollab')

                    })
                    socket.on('recieveCollab',(users)=>{
                        setCollaborators(users)
                    })

                    const interval=setInterval(()=>{
                        socket.emit('save-document',quill.getContents())
                    },SAVE_TIME)
                    const interval2=setInterval(()=>{
                        socket.emit('increaseTime')
                    },1000)
                }
            })

            
            return()=>{
                socket.off('givenPossession',response=>{
                    if(response==='given'){
                        document.getElementById('collab').addEventListener('click',()=>{
                            socket.emit('giveCollab')
    
                        })
                        socket.on('recieveCollab',(users)=>{
                            setCollaborators(users)
                        })
    
                        const interval=setInterval(()=>{
                            socket.emit('save-document',quill.getContents())
                        },SAVE_TIME)
                        const interval2=setInterval(()=>{
                            socket.emit('increaseTime')
                        },1000)
                    }
                })
            }
        }
    },[socket,quill,canEdit])

    useEffect(()=>{
        if(socket==null || quill==null || canEdit==null)
            return
        if(canEdit===1){
            quill.enable()
        }
        if(canEdit===0){
            quill.disable()
        }
        return()=>{
            quill.disable()
        }
    },[socket,quill,canEdit])

    const containerRef=useCallback((wrapper)=>{
        // console.log('7')
        if(wrapper===null)
            return
        wrapper.innerHTML=""
        const editor=document.createElement('div')
        wrapper.append(editor)
        const q=new Quill(editor,{
            theme:'snow',
            modules:{
                toolbar:TOOLBAR
            }
        })
        
        // q.setText('hel')
        setQuill(q)
        // q.disable()
    },[])

    const sharehandler=()=>{
        if(doc===null)
            return
        alert(`Copy this link to give edit access - http://localhost:3000/documents/${doc._id}?sharing=${doc.editLink} \n\nCopy this link to give view access - http://localhost:3000/documents/${doc._id}?sharing=${doc.viewLink}`);
    }
    //
    // console.log(activeUsers)
    return (
      <>
        {doc !== null && (
          <div className="docheading">
            <h1>{doc.title}</h1>
          </div>
        )}
        <div className="docbutton">
          <Button size="lg" col="md-3" onClick={handleBack} color="primary">
            Go Back
          </Button>{" "}
          <Button size="lg" onClick={toggle} color="secondary">
            Active Users
          </Button>{" "}
          <Button size="lg" id="collab" onClick={toggle1} color="success">
            Collaborators
          </Button>{" "}
          <Button size="lg" onClick={sharehandler} color="warning">
            Share
          </Button>{" "}
        </div>
        <div className="container" ref={containerRef}></div>

        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>Active Users</ModalHeader>
          <ModalBody>
          {activeUsers!==null &&(
          <ListGroup>
            {activeUsers.map((user,index)=>{
                return(
                <ListGroupItem style={{padding:'5px'}} key={index}>
                    <div style={{fontSize:'14px'}}>{user.name}</div>
                    <div style={{fontSize:'10px'}}>{user.email}</div>
                </ListGroupItem>)
            })}
            
          </ListGroup>)}
          </ModalBody>
          
        </Modal>

        <Modal isOpen={modal1} toggle={toggle1}>
          <ModalHeader toggle={toggle1}>Collaborators</ModalHeader>
          <ModalBody>
          {collaborators!==null &&(
          <ListGroup>
            {collaborators.map((user,index)=>{
                return(
                <ListGroupItem style={{padding:'5px'}} key={index}>
                    <div style={{fontSize:'14px'}}>{user.name}</div>
                    <div style={{fontSize:'10px'}}>{user.email}</div>
                </ListGroupItem>)
            })}
            
          </ListGroup>)}
          </ModalBody>
          
        </Modal>
      </>
    );
}

export default TextEditor
