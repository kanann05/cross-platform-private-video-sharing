
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './home/Home.js'
import FolderPage from './FolderPage.js';
import Player from './Player.js';
import reactplayer from 'react-player'
function Login({ setLoggedin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [inv, setInv] = useState(false);
  const navigate = useNavigate();

  function ErrorLoginDB() {
    return (
      <p
        style={{
          margin: "0px 0px",
          position: "absolute",
          bottom: "-40px",
          visibility: inv ? "visible" : "hidden",
          color: "rgba(255, 58, 58, 0.72)",
          fontSize: "0.8em",
        }}
      >
        Invalid username or password, please check again.
      </p>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "min(300px, 70vw)",
      }}
    >
      <input
        value={user}
        onChange={(e) => setUser(e.target.value)}
        style={{
          outline: "none",
          color: "rgba(255, 255, 255, 0.8)",
          width: "100%",
          backgroundColor: "#3B3B3B",
          height: "35px",
          borderRadius: "5px",
          border: "none",
          boxShadow: "inset 0px 0px 9px -6px rgba(171, 204, 224, 0.49)",
          paddingLeft: "15px",
          fontFamily: "lexend",
          fontSize: "0.9em",
        }}
        placeholder="Username"
      />
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        style={{
          outline: "none",
          color: "rgba(255, 255, 255, 0.8)",
          width: "100%",
          backgroundColor: "#3B3B3B",
          height: "35px",
          borderRadius: "5px",
          border: "none",
          boxShadow: "inset 0px 0px 9px -6px rgba(171, 204, 224, 0.49)",
          paddingLeft: "15px",
          fontFamily: "lexend",
          fontSize: "0.9em",
        }}
        placeholder="Password"
      />
      <button
        onClick={async () => {
          const response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
            },
            body: JSON.stringify({ username: user, password: pass }),
          });

          if (!response.ok) {
            console.log("error");
            setInv(true);
          } else {
            const data = await response.json();
            if (data) {
              localStorage.setItem("accessToken", data.accesstoken);
              localStorage.setItem("username", user) // Save token
              console.log(localStorage)
              setLoggedin(true);
              navigate("/");
            }
          }
        }}
        className="login-button"
      >
        Submit
      </button>
      <ErrorLoginDB />
    </div>
  );
}



function App() {
  const [loggedin, setLoggedin] = useState(null); // null indicates loading state

  // Run the authentication check on component mount
  useEffect(() => {
    console.log("app loaded");
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("username");
      console.log(user)
      if (!token) {
        setLoggedin(false); // No token, user is not authenticated
        return;
      }
  
      try {
        const response = await fetch('/checkTok', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accesstoken: token, username : user })
          
        });
  
        if (!response.ok) {
          setLoggedin(false); 
          localStorage.setItem("accessToken", "")// Invalid token, user is not authenticated
          localStorage.setItem("username", "");
          return;
        }
  
        const data = await response.json();
        if (data) {
          setLoggedin(true); // User is authenticated
          
          localStorage.setItem("data", JSON.stringify(data));
          
        } else {
          setLoggedin(false); // No valid data received
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setLoggedin(false); // Handle any network or unexpected errors
      }
    };
  
    checkAuth();
  }, []);
  

  if (loggedin === null) {
    // Render a loading state until we know the authentication status
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Router>
        <Routes>
          <Route exact path = '/player' element = {<Player />} />
          {/* Default route goes here (Home) */}
          <Route exact path="/" element={loggedin ? <Home setLoggedin={setLoggedin} /> : <Navigate to="/login" />} />
          {/* <Route exact path = "tesss" element = {<FolderPage />}></Route> */}
          {JSON.parse(localStorage.getItem("data")) == null ? (null) : JSON.parse(localStorage.getItem("data")).map((fo, i) => (
      <Route key={i} exact path={fo.foldername} element={<FolderPage />} />
      ))}          {/* Other routes can follow */}
          <Route exact path="/login" element={loggedin ? <Navigate to = "/" /> : <Login setLoggedin={setLoggedin} />} />
        </Routes>
      </Router>
    </div>
    
  );
}

export default App;



// import logo from './logo.svg';
// import './App.css';
// import react, {useState, useEffect} from 'react'
// import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';

// let access = ""
// function Login({ setLoggedin }) {
//   let [user, setUser] = useState("");
//   let [pass, setPass] = useState("");
//   let navigate = useNavigate(); 
//   let [inv, setInv] = useState(false);
//   function ErrorLoginDB() {
//     return(<p style = {{
//       margin : "0px 0px",
//       position : "absolute",
//       bottom : "-40px",
//       visibility : inv?"visible" : "hidden",
//       color : "rgba(255, 58, 58, 0.72)",
//       fontSize : "0.8em"

//     }}>Invalid username or password, please check again.</p>)
//   }
//   return (
//     <div style={{ position: "relative", justifyContent: 'center', alignItems: "center", display: "flex", flexDirection: "column", gap: "15px", width: "min(300px, 70vw)" }}>
//       <input 
//         value={user} 
//         onChange={(e) => { setUser(e.target.value) }} 
//         style={{ outline: "none", color: "rgba(255, 255, 255, 0.8)", width: "100%", backgroundColor: "#3B3B3B", height: "35px", borderRadius: "5px", border: "none", boxShadow: "inset 0px 0px 9px -6px rgba(171, 204, 224, 0.49)", paddingLeft: "15px", fontFamily: "lexend", fontSize: "0.9em" }} 
//         placeholder='Username' 
//       />
//       <input 
//         type="password" 
//         value={pass} 
//         onChange={(e) => { setPass(e.target.value) }} 
//         style={{ outline: "none", color: "rgba(255, 255, 255, 0.8)", width: "100%", backgroundColor: "#3B3B3B", height: "35px", borderRadius: "5px", border: "none", boxShadow: "inset 0px 0px 9px -6px rgba(171, 204, 224, 0.49)", paddingLeft: "15px", fontFamily: "lexend", fontSize: "0.9em" }} 
//         placeholder='Password' 
//       />
//       <button 
//         onClick={async () => {
//           const response = await fetch('/login', {
//             method: 'POST',
//             headers: {
//               'Content-type': 'application/json'
//             },
//             body: JSON.stringify({ username: user, password: pass })
//           })
//           if(!response.ok) {
//             console.log("error");
//             setInv(true)
//           }
//           else {
//             let data = await response.json();
//             if (data) {
//               // setLoggedin(true); // Update state
//               // navigate("/"); // Navigate to Home
//               // console.log(data.accesstoken)
//               access = data.accesstoken
//               await fetch('/checkTok', {
//                 method : 'POST',
//                 headers: {
//                   'Content-Type': 'application/json', // Correct header for JSON
//                 },
//                 body : JSON.stringify({"accesstoken" : access})
//               }).then(res => res.json()).then(dat => {
//                 if(data != null) {
//                   setLoggedin(true)
//                   navigate("/")
//                 }
//               })
//             }
//             }
//           }
          
//           // const data = await response.json();
//           // if (data) {
//           //   setLoggedin(true); // Update state
//           //   navigate("/"); // Navigate to Home
//           // }
//         }
//         className="login-button"
//       >
//         Submit  
//       </button>
//       <ErrorLoginDB />
//     </div>
//   );
// }
// function Home() {
//   return(<div style = {{color : "white"}}>hello.</div>)
// }

// function App() {
//   let [loggedin, setLoggedin] = useState(false);

//   return (
//     <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <Router>
//         <Routes>
//           {/* <Route exact path='/' element={loggedin ? <Home /> : <Navigate to="/login" />} /> */}
//           <Route exact path='/' element={loggedin ? <Home /> : <Navigate to="/login" />} />
//           <Route exact path='/login' element={<Login setLoggedin={setLoggedin} />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;


