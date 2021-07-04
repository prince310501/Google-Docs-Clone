import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { Bar } from 'react-chartjs-2';
import Footer from './Footer'
import Navigation from './Navigation'
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
axios.defaults.withCredentials=true

const Admin = (props) => {
    const [currUser,setCurrUser]=useState(null)
    const[allUsers,setAllUsers]=useState(null)
    const [adminUser,setAdminUser]=useState(null)
    const [chartData,setChartData]=useState(null)
    const[activeUsers,setActiveUsers]=useState(null)
    useEffect(() => {
        if(props.history===null)
            return
        axios.get('http://localhost:5000/login')
        .then(res=>{
            if(res.data.loggedin===true){
                if(res.data.user.isAdmin!==true ){
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
    }, [])

    useEffect(() => {
        if(props.history===null)
            return
        axios.get('http://localhost:5000/allusers')
        .then(res=>{
            setAllUsers(res.data.users) 
        })
        .catch(err=>console.log(err))
        return ()=>{
            setAllUsers(null)
        }
    }, [])

    useEffect(()=>{
      if(allUsers===null)
        return
      setAdminUser(allUsers.filter((user)=>user.isAdmin===true))
      const demoActive=[]
      allUsers.forEach((user)=>{
        if(user.isAdmin===false){
          const totalTime=user.possessDoc.reduce((totTime,doc)=>{
            return totTime+doc.time
          },0)
          demoActive.push({
            name:user.name,
            email:user.email,
            totalTime:totalTime/60
          })
        }
      })
      demoActive.sort((a,b)=>{
        return(b.totalTime-a.totalTime)
      })
      const demo =demoActive.slice(0,3)
      setActiveUsers(demo)
      return()=>{
        setAdminUser(null)
        setActiveUsers(null)
      }
    },[allUsers])

    useEffect(()=>{
      if(adminUser===null)
        return
      
      const docName=[]
      const docTime=[]
      adminUser[0].possessDoc.forEach((doc)=>{
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
      return()=>{
        setChartData(null)
      }
    },[adminUser])
    // console.log(activeUsers)
    return (
      <>
        <Navigation />
        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Admin's DashBoard</h1>
        </div>

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Users</h1>
        </div>
        {allUsers !== null && allUsers.length === 1 && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h4>You are the only User</h4>
          </div>
        )}
        {allUsers !== null && (
          <div style={{ maxWidth: "60%", margin: "0 auto", fontSize: "15px" }}>
            <ListGroup>
              {allUsers.map((user, index) => {
                const total = user.possessDoc.length;
                if (user.isAdmin === false) {
                  return (
                    <ListGroupItem
                      color="info"
                      tag="a"
                      href={`/dashboard/${user._id}`}
                      key={index}
                      className=""
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                      }}
                      action
                    >
                      <h5>{user.name}</h5>
                      <h5>{user.email}</h5>
                      <Badge pill>{total}</Badge>
                    </ListGroupItem>
                  );
                }
                return null;
              })}
            </ListGroup>
          </div>
        )}

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Your Documents</h1>
        </div>

        {adminUser !== null &&
          adminUser[0].possessDoc.length === 0 && (         
              <div style={{ textAlign: "center" }} className="my-5">
                <h4>You don't have documents</h4>
              </div>
          )}
        {adminUser !== null && (
          <div style={{ maxWidth: "60%", margin: "0 auto", fontSize: "10px" }}>
            <ListGroup>
              {adminUser[0].possessDoc.map((doc, index) => {
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

                    <form action={`http://localhost:5000/deleteDoc/${doc.docId._id}/${adminUser[0]._id}?_method=DELETE&path=admin`} method="POST">
                    <input type="submit" className="btn btn-info" value="Delete" />
                    </form> 
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </div>
        )}

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Analysis</h1>
        </div>
        {adminUser !== null && adminUser[0].possessDoc.length === 0 && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h4>Graph Analysis not available</h4>
          </div>
        )}
        {adminUser !== null && adminUser[0].possessDoc.length !== 0 && chartData!==null && (
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

        <div style={{ textAlign: "center" }} className="my-5">
          <h1>Active Users</h1>
        </div>
        
        {activeUsers !== null && activeUsers.length === 0 && (
          <div style={{ textAlign: "center" }} className="my-5">
            <h4>No Users</h4>
          </div>
        )}
        {activeUsers !== null && (
          <div className="mb-5" style={{ maxWidth: "60%", margin: "0 auto", fontSize: "15px" }}>
            <ListGroup>
              {activeUsers.map((user, index) => {
                const t1=user.totalTime*10
                const t2=Math.round(t1)
                const t3=t2/10
                  return (
                    <ListGroupItem
                      color="info"
                      tag="a"
                      href={`/dashboard/${user._id}`}
                      key={index}
                      className=""
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                      }}
                      action
                    >
                      <h5>{user.name}</h5>
                      <h5>{user.email}</h5>
                      <Badge pill>{t3} mins</Badge>
                    </ListGroupItem>
                  );
                
              })}
            </ListGroup>
          </div>
        )}

        <Footer />
      </>
    );
}

export default Admin
