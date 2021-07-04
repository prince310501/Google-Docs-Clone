import React,{useState,useEffect} from 'react'
import TextEditor from './TextEditor'
import Home from './Home'
import {BrowserRouter,Route,Switch,Redirect} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Dashboard from './Dashboard'
import Admin from './Admin'
import {v4 as uuidv4} from 'uuid'

function App() {
  
  return (
    <div className="App" >
      <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/admin" component={Admin}/>
        <Route path="/dashboard/:id" component={Dashboard}/>
        <Route path="/documents/:id" component={TextEditor} />
      </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
