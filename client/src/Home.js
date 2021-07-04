import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import queryString from "query-string";
import { Alert } from "reactstrap";
import axios from "axios";

import { ListGroup, ListGroupItem, Badge } from "reactstrap";

axios.defaults.withCredentials = true;

const Home = (props) => {
  const status = props.location.state;
  const { msg } = queryString.parse(props.location.search);
  const [currUser, setCurrUser] = useState(null);
  useEffect(() => {
    console.log("fetched at home");
    axios
      .get("http://localhost:5000/login")
      .then((res) => {
        if (res.data.loggedin === true) {
          setCurrUser(res.data.user);
        } else {
          setCurrUser(null);
        }
      })
      .catch((err) => console.log(err));
    return () => {
      setCurrUser(null);
    };
  }, []);

  return (
    <div>
      <Navigation />
      <Alert
        color="primary"
        className="mx-auto mt-5"
        style={{ maxWidth: "60%", padding: "45px 30px ", fontSize: "15px" }}
      >
        <h2 className="alert-heading">Welcome Back!</h2>
        <br />
        <p>
          This is a clone of Google Doc . You can add,manage,share your documents.I have modified some features like you can analyse time given to each document.
          There are 2 types of role-user and admin. admin has certain permission to watch User's dashboard. The major features of Google docs are there in it.
        </p>
        <hr />
        <p className="mb-0">
          Enjoy Documenting your Documents!
        </p>
      </Alert>
      <br />
      <br />

      <h3 style={{ textAlign: "center", margin: "10px" }}>{msg}</h3>
      <h3 style={{ textAlign: "center", margin: "10px" }}>{status}</h3>

      <Footer />
    </div>
  );
};

export default Home;
