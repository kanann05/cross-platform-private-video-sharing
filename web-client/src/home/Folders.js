import '../App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Form, Link } from 'react-router-dom';
import data from '../data.js'
import axios from 'axios';
import FolderPage from '../FolderPage.js'
function Folder({ folderName, imgUrl}) {
    let [img, setImg] = useState(null)
    function Del() {
        return(<div className = "del-folder" style = {{width : "21px", height : "21px", fontSize : '10px', borderRadius : "100%", position : "absolute", top : "5px", right : "5px", backgroundColor:"rgba(0,0, 0, 0.7)", color : "white", textAlign:'center', display: "flex", justifyContent: "center", alignItems: 'center'}}>X</div>)
    }
    useEffect(() => {
        if(imgUrl.charAt(0) == '/') {
          const fetchImage = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
              console.error('No token found, user is not logged in');
              return; // Optionally show an error to the user
            }
        
            try {
              const response = await fetch(imgUrl, {
                method: 'POST',  
                headers: {
                  'Content-Type': 'application/json',
                },
                body : JSON.stringify({'token' : localStorage.getItem("accessToken")})
              });
        
              if (!response.ok) {
                if (response.status === 401) {
                  console.error('Unauthorized access');
                 
                } else {
                  console.error('Error fetching image:', response.statusText);
                }
                return;
              }
        
              const imgBlob = await response.blob();
              const imgObjectURL = URL.createObjectURL(imgBlob); 
              setImg(imgObjectURL);
            } catch (error) {
              console.error('Error fetching image:', error);
            }
          };
        
          fetchImage();
        }
        else {
          setImg(imgUrl);
        }
        
      }, []);
      
    
    const rout = folderName;
    return(<Link  
        to = {rout}
        state={{foldername : folderName}}
        onClick = {() => {
            
        }} id = {folderName} onMouseEnter = {() => {
        console.log("entered");
        document.getElementById(folderName).classList.add('folder-hovered');
    }} onMouseLeave = {() => {
        console.log("left");
        document.getElementById(folderName).classList.remove('folder-hovered');
    }} className = "folder" style = {{paddingTop : "10px", display : "flex", alignItems : "center", flexDirection : "column", position : "relative", backgroundColor : "rgb(66, 66, 66)"}}>
        
        <div onClick = {(e) => {e.preventDefault(); console.log("clicked x")}} onMouseEnter = {() => {console.log("enterred cross")}}className = "del-folder" style = {{zIndex : "5", width : "25px", height : "25px", fontSize : '12px', borderRadius : "100%", position : "absolute", top : "5px", right : "5px", backgroundColor:"rgba(0,0, 0, 0.7)", color : "white", textAlign:'center', display: "flex", justifyContent: "center", alignItems: 'center'}}>X</div>
        <div style={{
    position: "relative",
    width: "90%",
    aspectRatio: "1/0.8", 
    backgroundColor: "red",
    overflow: "hidden"  
}}>
    <img
        style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
        }}
        src={img}
        alt="Image"
    />
</div>


        
        <p style = {{color : "rgba(255,255,255, 0.8)", fontFamily : "poppins", fontWeight : "400", margin : "10px 0 10px 0", fontSize : "1.2rem"}}>{folderName}</p>
    </Link>)
}

export default function Folders() {
    let [data, setData] = useState(JSON.parse(localStorage.getItem('data')))
    useEffect(()=>{
        setData(JSON.parse(localStorage.getItem('data')));
        console.log(data)
    }, [])
    return(<div style = {{width : "80vw"}}className = "folders">
        
        {/* {console.log(data)} */}
        {data != null ? (data.map((folder, i ) => (
            
            <Folder folderName = {folder.foldername} imgUrl = {folder.img} key = {i} />))) : (null)}
        
    </div>);
}













// import '../App.css';
// import React, { useEffect, useState } from 'react';

// function Folder({ folderName, imgUrl }) {
//     return (
//         <div  onMouseEnter = {() => {
//             console.log("entered");
//             document.getElementById(folderName).classList.add('folder-hovered');
//         }} onMouseLeave = {() => {
//             console.log("left");
//             document.getElementById(folderName).classList.remove('folder-hovered');
//         }} 
//             id={folderName}
//             className="folder"
//             style={{
//                 paddingTop: "10px",
//                 display: "flex",
//                 alignItems: "center",
//                 flexDirection: "column",
//                 position: "relative",
//                 backgroundColor: "rgb(66, 66, 66)",
//             }}
//         >
//             <div
//                 className="del-folder"
//                 style={{
//                     zIndex: "5",
//                     width: "21px",
//                     height: "21px",
//                     fontSize: '10px',
//                     borderRadius: "100%",
//                     position: "absolute",
//                     top: "5px",
//                     right: "5px",
//                     backgroundColor: "rgba(0,0, 0, 0.7)",
//                     color: "white",
//                     textAlign: 'center',
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: 'center',
//                 }}
//             >
//                 X
//             </div>
//             <div style={{
//                 objectFit: "cover",
//                 position: "relative",
//                 width: "90%",
//                 aspectRatio: "1/0.8",
//                 backgroundColor: "red",
//             }}>
//                 <img
//                     style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                     }}
//                     src={imgUrl}
//                     alt={folderName}
//                 />
//             </div>
//             <p
//                 style={{
//                     color: "rgba(255,255,255, 0.8)",
//                     fontFamily: "poppins",
//                     fontWeight: "400",
//                     margin: "4px 0 4px 0",
//                     fontSize: "0.9rem",
//                 }}
//             >
//                 {folderName}
//             </p>
//         </div>
//     );
// }

// export default function Folders() {
//     const [folders, setFolders] = useState([]);

//     useEffect(() => {
//         // Debugging: Check if data exists in localStorage
//         const storedData = localStorage.getItem('data');
//         console.log('Raw storedData:', storedData);

//         if (storedData) {
//             try {
//                 const parsedData = JSON.parse(storedData);
//                 console.log('Parsed folders:', parsedData);
//                 setFolders(parsedData);
//             } catch (error) {
//                 console.error('Error parsing localStorage data:', error);
//             }
//         } else {
//             console.warn('No data found in localStorage');
//         }
//     }, []);

//     return (
//         <div style={{ width: "80vw" }} className="folders">
//             {folders.length > 0 ? (
//                 folders.map((folder, index) => (
//                     <Folder 
//                         key={index} 
//                         folderName={folder.foldername} 
//                         imgUrl={folder.img} 
//                     />
//                 ))
//             ) : (
//                 <p style={{ color: "white" }}>No folders to display.</p>
//             )}
//         </div>
//     );
// }X



