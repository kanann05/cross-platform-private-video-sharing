
import '../App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Form } from 'react-router-dom';
import data from '../data.js'
import axios from 'axios';

function NavBar({setLoggedin }) {
  let navigate = useNavigate();
  let [upvis, setUpvis] = useState(false);
  let [fn, setFn] = useState("");
  let [th, setTh] = useState("");
  let [file, setFile] = useState(null);
  let constfile = file;
  useEffect(() => {
    constfile = file;
  }, [file])
  useEffect(() => {

    const navUploadDb = document.querySelector('.nav-upload-db');
    if (upvis) {
      navUploadDb.classList.add('visible');
    
    } else {
      navUploadDb.classList.remove('visible');
      
    }
  }, [upvis]);
  return (<div className = "navBar" style = {{display : "flex", alignItems:"center", flexDirection : "column"}}>
    
    {/* <div className = "nav-bar">
        >
    </div> */}

  
  <div className = "nav-bar">
  

    <div className = "nav-search-bar">
        <input style = {{backgroundColor : "transparent"}} className = "search-bar" placeholder='Search for folder'></input>

        <div className = "search-img"
        
          style = {{
            height : "100%",
            width : "max(60px, 7.5%)",
            position : "relative",
            display:"flex",
            alignItems:"center",
            justifyContent : "center",

          }}
          
        >
          <img style = {{filter : "invert()", opacity : "0.7", width : "30%"}} src = "src-img.png" alt = "search img"/>
        </div>

    </div>
    <div className = "nav-buttons" style = {{
      display : "flex",
      flexDirection : "row",
      justifyContent : "space-between",
      width : "30%"
    }}>
      <div style = {{position : "relative"}}>
      <button className="nav-upload" onClick = {() => {setUpvis(!upvis)}}>
        <div style= {{margin : "0", display:"flex", flexDirection:"row", justifyContent : "center", alignItems:"center"}}>
        <img className = "upload-img" style =  {{
          display : "flex", justifyContent : "center"
        }}
            src="upload-img.png"
            alt="upload-icon"
        /> 
        <p>
        Upload </p>
        </div>
    </button>
    <div className = "nav-upload-db" style = {{zIndex : "5"}} >
      
      <input placeholder = "Folder name" value = {fn} onChange ={(e) => {
        setFn(e.target.value);
      }}></input>
      <p style = {{color : "white", margin : "-5px 0 -5px 0"}}>------------------------------</p>
      <input value = {th} placeholder = "Thumbnail link / upload" onChange={(e) => {
        setTh(e.target.value)
      }}>
        
      </input>
      <div style = {{flexDirection : "column",position : "relative", display : "flex", alignItems:"center", justifyContent : "space-between", width : "100%"}}>
      <input  type ="file" className = "add-folder-input"style = {{  position : "absolute", width : "50%", height : "22px", opacity : "0", marginTop : "-5px", width:"70%", backgroundColor : "transparent", color : "beige"}} onChange={(e)=>{
        setFile(e.target.files[0]);
      }}>
       
      </input>
      <div onClick={() => document.querySelector(".add-folder-input").click()} style = {{position : "absolute", width : "40%", height : "25px", zIndex : "5", backgroundColor : "rgba(0,0,0,0.3)", borderRadius : "4px", display : "flex", alignItems :"center", justifyContent : "center", color : "rgb(237, 252, 255)", fontSize : "0.75rem", fontFamily : "lexend", fontWeight : "200"}}>Upload locally</div>
      <p style = {{margin : "25px 0 0 0", color : "rgba(255, 255, 255, 0.35", fontSize : "0.8rem"}}>{file == null ? "" : file.name}</p>
      </div>
      {/* <button style = {{width:"30%", height : "25px", marginTop : "-7px", marxginBottom:"6px"}}>Upload</button> */}
      <p style = {{color : "white", margin : "-10px 0 -5px 0"}}>------------------------------</p>
      <button style = {{backgroundColor : "rgba(0,0,0,0.4)"}} onClick = {async (e)=>{
        if(constfile != null && th != "") {
          alert("either enter url or upload the image");
          return;
        }
        e.preventDefault();
        let formdata = new FormData();
        let fileup = constfile;
        if(constfile != null) {
          fileup = new File([constfile], `${localStorage.getItem('username')}&&$${fn}&&$${constfile.name}`, {type : file.type});
        }
        formdata.append('img-file', fileup);
        formdata.append('username', localStorage.getItem('username'));
        formdata.append('imgUrl', th);
        formdata.append('folderName', fn);

        try {
          const res = await axios.post('/uploadimg', formdata, {
            headers : {'username' : localStorage.getItem('username')},
          });
          console.log(res.data)
          window.location.reload()
        }
        catch(error) {
          alert('process failed. Make sure folder name and/or image name/url doesn`t already exist')
        }
      }}>Add</button>
    </div>
    </div>

      <button className = "log-out" onClick ={()=> {
          localStorage.setItem("accessToken", "");
          localStorage.setItem("username", "")
          setLoggedin(false);
          
      }}>
        <img className = "log-out-img" src = "upload-img.png" style = {{height : "100%", aspectRatio : "1/1", transform : "rotate(270deg)", filter : "invert()", opacity : "0.7"}}/>
        <p>
          Log out</p>
      </button> 
    </div>
  </div>
  {/* <div style={{ color: "white" }}>hello.</div> */}
  </div>);
}
export default NavBar;