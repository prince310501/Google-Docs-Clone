import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { withRouter,Redirect } from 'react-router-dom';

import {
    Container,
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    NavbarText,
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Form, FormGroup, Label, Input, FormText
  } from 'reactstrap';
  
  axios.defaults.withCredentials=true

const Navigation = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const [modal, setModal] = useState(false);
    const toggle1 = () => setModal(!modal);
    const [modal2, setModal2] = useState(false);
    const toggle2 = () => setModal2(!modal2);

    const[currUser,setCurrUser]=useState(null)
    useEffect(() => {
        console.log('navbar login fetched')
        axios.get('http://localhost:5000/login')
        .then(res=>{
            if(res.data.loggedin===true){
                setCurrUser(res.data.user)
            }
            else{
                setCurrUser(null)
            }
        })
        .catch(err=>console.log(err))
        return ()=>{
          setCurrUser(null)
        }
    },[])


    const signfun=(e)=>{
        e.preventDefault()
        toggle1()
        const name=document.getElementById('name').value
        const email=document.getElementById('email').value
        const pass=document.getElementById('password').value
        const verPass=document.getElementById('verPassword').value
        if(pass!==verPass){
            
            props.history.push('/?msg=Passwords+do+not+match')
            return
        }
        axios.post('http://localhost:5000/signup',{email,pass,name})
        .then(res=>{
          props.history.push(`/?msg=${res.data.msg}`)
        })
        .catch(err=>console.log(err))

    }
    const loginfun=(e)=>{
      e.preventDefault()
      toggle2()
      const email=document.getElementById('email2').value
      const pass=document.getElementById('password2').value
      const role=document.getElementById('role').value
      axios.post('http://localhost:5000/login',{email,pass,role:role==='admin'?true:false})
      .then(res=>{
        if(res.data.msg){
          props.history.push(`/?msg=${res.data.msg}`)
        }
        else{
          props.history.push('/')
        }
      })
      .catch(err=>console.log(err))
    }

    // if(currUser!==null)
      // console.log(currUser._id)

    return (
      <>
        <Navbar
          style={{ padding: "20px", fontSize: "20px" }}
          color="info"
          light
          expand="md"
        >
          <Container>
            <NavbarBrand href="/">
              <h1>Google Docs</h1>
            </NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem>
                  <NavLink href="/">Home</NavLink>
                </NavItem>
                {currUser === null && (
                  <NavItem>
                    <NavLink href={`/DashBoard/ab`}>
                      DashBoard
                    </NavLink>
                  </NavItem>
                )}
                {currUser !== null && (
                  <NavItem>
                    <NavLink href={currUser.isAdmin? '/admin' : `/dashboard/${currUser._id}`}>
                      DashBoard
                    </NavLink>
                  </NavItem>
                )}
                {currUser === null && (
                  <NavItem>
                    <NavLink href="#" onClick={toggle1}>
                      Signup
                    </NavLink>
                  </NavItem>
                )}
                {currUser === null && (
                  <NavItem>
                    <NavLink href="#" onClick={toggle2}>
                      Login
                    </NavLink>
                  </NavItem>
                )}
                {currUser !== null && (
                  <NavItem>
                    <NavLink href="http://localhost:5000/logout">
                      Logout
                    </NavLink>
                  </NavItem>
                )}
              </Nav>
              <NavbarText className="mr-sm-2">
                <span className="glyphicon glyphicon-user"></span>
                {currUser === null ? "Guest" : currUser.name}
              </NavbarText>
            </Collapse>
          </Container>
        </Navbar>

        <Modal size="lg" isOpen={modal} toggle={toggle1}>
          <ModalHeader toggle={toggle1}>Sign Up</ModalHeader>
          <ModalBody>
            <Form onSubmit={signfun}>
              <FormGroup>
                <Label for="name" size="lg">
                  Full Name
                </Label>
                <Input
                  bsSize="lg"
                  type="text"
                  pattern="([a-zA-Z]+\s){1,}([a-zA-Z]+)"
                  name="name"
                  id="name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label size="lg" for="email">
                  Email
                </Label>
                <Input
                  bsSize="lg"
                  type="email"
                  name="email"
                  id="email"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label size="lg" for="password">
                  Password
                </Label>
                <Input
                  bsSize="lg"
                  type="password"
                  minLength="5"
                  name="password"
                  id="password"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label size="lg" for="verPassword">
                  Verify Password
                </Label>
                <Input
                  bsSize="lg"
                  type="password"
                  minLength="5"
                  name="verPassword"
                  id="verPassword"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Input bsSize="lg" type="submit" value="Sign Up" />
              </FormGroup>
            </Form>
          </ModalBody>
          {/* <ModalFooter>
                <Button color="primary" onClick={toggle}>Do Something</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter> */}
        </Modal>

        <Modal size="lg" isOpen={modal2} toggle={toggle2}>
          <ModalHeader toggle={toggle2}>Login</ModalHeader>
          <ModalBody>
         
            <Form action="http://localhost:5000/login" method="POST">
              <FormGroup>
                <Label size="lg" for="email">
                  Email
                </Label>
                <Input
                  bsSize="lg"
                  type="email"
                  name="email2"
                  id="email2"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label size="lg" for="password">
                  Password
                </Label>
                <Input
                  bsSize="lg"
                  type="password"
                  minLength="5"
                  name="password2"
                  id="password2"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label size="lg" for="role">
                  Select Role
                </Label>
                <Input bsSize="lg" type="select" name="role" id="role" required>
                  <option value="">choose role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Input type="submit" bsSize="lg" value="Login" />
              </FormGroup>
            </Form>
          </ModalBody>
          {/* <ModalFooter>
                <Button color="primary" onClick={toggle}>Do Something</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter> */}
        </Modal>
      </>
    );
}

export default withRouter(Navigation)
