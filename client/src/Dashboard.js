import React,{useState,useEffect} from 'react'
import queryString from 'query-string'
import Footer from './Footer'
import Navigation from './Navigation'
import axios from 'axios'
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { Bar } from 'react-chartjs-2';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Form,
  FormGroup,
} from "reactstrap";

axios.defaults.withCredentials=true

const Dashboard = (props) => {
    const userid=props.match.params.id
    // const msg=queryString.parse(props.location.search)
    const [currUser,setCurrUser]=useState(null)
    const[dashboardUser,setDashboardUser]=useState(null)
    const[chartData,setChartData]=useState(null)
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);


    useEffect(() => {
        if(userid===null || props.history===null)
            return
        axios.get('http://localhost:5000/login')
        .then(res=>{
            if(res.data.loggedin===true){
                if(res.data.user.isAdmin!==true && res.data.user._id!==userid){
                    props.history.push('/')
                }
                else
                {
                    setCurrUser(res.data.user)
                }
            }
            else{
                props.history.push('/')   
            }
        })
        .catch(err=>console.log(err))
        return ()=>{
            setCurrUser(null)
        }
    }, [userid,props.history])


    useEffect(() => {
        if(userid===null || props.history===null)
            return
        axios.get(`http://localhost:5000/dashboarduser/${userid}`)
        .then(res=>{
            if(res.data.user){
                setDashboardUser(res.data.user)
                const docName=[]
                const docTime=[]
                res.data.user.possessDoc.forEach((doc)=>{
                  docName.push(doc.docId.title)
                  docTime.push(doc.time/60)
                })
                setChartData({
                  labels: docName,
                  datasets: [{
                      label: 'Time in mins ',
                      data: docTime,
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                  }]
                })
            }
            else{
                props.history.push({to:'/',state:'Dashboard do not exist'})
            }
        })
        .catch(err=>console.log(err))
        return () => {
            setDashboardUser(null)
            setChartData(null)
        }
    }, [userid,props.history])

    console.log(chartData)
   
    return (
      <div>
        <Navigation />
        {dashboardUser !== null && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h1>{dashboardUser.name}'s DashBoard</h1>
          </div>
        )}

        {currUser !== null && currUser.isAdmin === false && (
          <div style={{ textAlign: "center" }} className="my-5">
            <Button size="lg" onClick={toggle} outline color="primary">
              New Document
            </Button>
          </div>
        )}

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Your Documents</h1>
        </div>
        {dashboardUser !== null && dashboardUser.possessDoc.length === 0 && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h4>You don't have documents</h4>
          </div>
        )}
        {dashboardUser !== null && currUser !== null && (
          <div style={{ maxWidth: "60%", margin: "0 auto", fontSize: "10px" }}>
            <ListGroup>
              {dashboardUser.possessDoc.map((doc, index) => {
                const create = new Date(doc.docId.createdAt);
                const update = new Date(doc.docId.updatedAt);

                return (
                  <ListGroupItem
                    color="info"
                    tag="a"
                    href={`/documents/${doc.docId._id}?sharing=${doc.docId.editLink}`}
                    key={index}
                    className=""
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                    }}
                    action
                  >
                    <div>
                      <h5>{doc.docId.title}</h5>
                      <span>Created At- {create.toLocaleString()}</span>
                      <span>
                        &nbsp; Last visited/updated- {update.toLocaleString()}
                      </span>
                    </div>

                    {currUser.isAdmin === false && (
                      <form
                        action={`http://localhost:5000/deleteDoc/${doc.docId._id}/${currUser._id}?_method=DELETE&path=dashboard/${currUser._id}`}
                        method="POST"
                      >
                        <input
                          type="submit"
                          className="btn btn-info"
                          value="Delete"
                        />
                      </form>
                    )}
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </div>
        )}

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Analysis</h1>
        </div>

        {dashboardUser !== null && dashboardUser.possessDoc.length === 0 && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h4>Graph Analysis not available</h4>
          </div>
        )}

        {dashboardUser !== null && dashboardUser.possessDoc.length !== 0 && chartData!==null && (
          <Bar
          data={chartData}
          
          style={{margin:'10px 20%',maxWidth:'60%'}}
          options= {{
            maintainAspectRatio: true,
            responsive: true,  
            layout:{
              padding:{
                left:50,
                right:50,
                top:0,
                bottom:0
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                fontSize:'25px',
                text: 'Graph Analysis'
              }
            },
            scales: {
              y: {
                  beginAtZero: true
              }
            }
          }}/>
        )}

        <Footer />
        <Modal isOpen={modal} toggle={toggle} size="lg">
          <ModalHeader toggle={toggle}>New Document</ModalHeader>
          <ModalBody>
            <Form action="http://localhost:5000/newdoc" method="POST">
              <FormGroup>
                <Label size="lg" for="email">
                  Document Title
                </Label>
                <Input
                  bsSize="lg"
                  type="text"
                  name="title"
                  id="title"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Input type="submit" bsSize="lg" value="Create" />
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
}

export default Dashboard
