import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Form, Link, useLocation} from 'react-router-dom';
import data from './data.js'
import axios from 'axios';
import Player from './Player.js'

function Subfolder({ sfname, setFocus, focus }) {
    return(<div onClick = {() => {
        if(document.getElementById(focus) != null) {
         document.getElementById(focus).style.backgroundColor = "rgba(57, 57, 57, 0.7)";
        }
        setFocus(sfname)
    }} className = "sf-div" id = {sfname} style = {{
        cursor : "pointer",
        overflow : "hidden",
        backgroundColor : "rgba(57, 57, 57, 0.7)",
        width : "100%",
        marginBottom : "10px",
        height : "40px",
        display : "flex",
        alignItems : "center",
        justifyContent : "center",
        color : "rgba(216, 234, 255, 0.73)",
        position : "relative"
    }}>
        {sfname}
        {/* <div className = "sf-botbor"></div> */}
    </div>)
}
function SubFolders({ subfolders, setFocus, focus }) {
    return(<div style = {{marginTop : "0px", position : "relative", width : "100%"}}>
            {subfolders != null ? (subfolders.map((f, i) => (<Subfolder focus = {focus}setFocus = {setFocus} sfname={f} key = {i}/>))) : (null)}
        </div>)
}

function Video({ vidname, src, folder, subfolder }) {
    let [video, setVideo] = useState(null);
    // useEffect(() => {
    //     console.log(src)
    //     if(src.charAt(0) == '/') {
    //         console.log(vidname)
    //         let videocall = async () => {
    //             try {
    //                 console.log(vidname);
    //                 const response = await fetch(src, {
    //                     method : 'POST',
    //                     headers : {'Content-type' : 'application/json'},
    //                     body : JSON.stringify({'token' : localStorage.getItem("accessToken") })
                    
    //                 })
    //                 if(!response.ok) {
    //                     if(response.status == 401) {
    //                         console.log("unauth access");
    //                         return;
    //                     }
    //                     setVideo(src);
    //                 }
    //                 else {
    //                     const videoBlob = await response.blob();
    //                     const videoObjectURL = URL.createObjectURL(videoBlob); 
    //                     console.log(videoObjectURL + vidname);
    //                     setVideo(videoObjectURL)
    //                 }
    //             }
    //             catch (error) {
                    
    //             }
    //         }
    //         videocall();
    //     }
    //     else {
    //         setVideo(src);
    //     }
    // }, [])

    return(<Link to = '/player' state={{src : src}} className = "sf-div" id = {vidname} style = {{
        overflow : "hidden",
        backgroundColor : "rgba(57, 57, 57, 0.7)",
        width : "100%",
        marginBottom : "10px",
        height : "40px",
        display : "flex",
        alignItems : "center",
        justifyContent : "center",
        color : "rgba(216, 234, 255, 0.73)",
        position : "relative"
    }}>{vidname}<div className = "sf-botbor"></div></Link>)
}

export default function FolderPage() {
    const location = useLocation();
  const folder = location.state?.foldername || decodeURIComponent(window.location.pathname);
    console.log(folder)
    let [toggle, setToggle] = useState(true);
    let [folderT, setFolderT] = useState(false);
    let [sfn, setSfn] = useState("");
    let [subfolders, setSubfolders] = useState(null);
    let [focus, setFocus] = useState(null);
    let [videos, setVideos] = useState(null);
    let [file, setFile] = useState(null);
    let [avtoggle, setAvtoggle] = useState(false);
    let [vn, setVn] = useState("");
    let [vl, setVl] = useState("");

    useEffect(() => {
        if(focus != null) {
            document.getElementById(focus).style.backgroundColor = "rgba(0, 0, 0, 0.65)";
            
             
            fetch('/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: localStorage.getItem("username"),
                    folder: folder,
                    subfolder: focus,
                }),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json(); 
                })
                .then((data) => {
                    console.log(data)
                    setVideos(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            
            
            
        }
    }, [focus])
    useEffect(() => { 
        const fetchData = async () => {
            try {
                const res = await fetch('/subfolders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user: localStorage.getItem("username"),
                        folder: folder,
                    }),
                });
    
                if (!res.ok) {
                    alert('Something went wrong');
                    return;
                }
    
                const data = await res.json(); 
                setSubfolders(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(()=> {
        if(toggle) {
            document.querySelector('.fp-body-wrapper').style.justifyContent = "space-between";
            document.querySelector('.fp-body-wrapper').style.right = "5vw";
            document.querySelector('.sf-sb').classList.add('sf-sb-vis');
            // document.querySelector('.sf-sb').style.display = "flex";
        }
        else {
            document.querySelector('.fp-body-wrapper').style.justifyContent = "center";
            document.querySelector('.fp-body-wrapper').style.right = "0vw";
            document.querySelector('.sf-sb').classList.remove('sf-sb-vis')
        }
    }, [toggle])
    return(<div style = {{minHeight : "100vh", display : "flex", flexDirection : "column"}}>

        <div className = "fp-nav">
            <div className = "fp-nav-sf" style = {{position : "relative"}}>
            <div onClick = {()=> {setToggle(!toggle)}} className = "fp-nav-dd" style = {{borderRightWidth : "2px", borderRightStyle : "rgba(255, 255, 255, 0.8)", borderRightStyle : "solid", backgroundColor : "rgba(112, 131, 190, 0.28)", position : "relative", width : "25%", height : '100%', alignItems : "center", justifyContent : 'center'}}>
                        <img src="dd.svg" style={{ transform : toggle? "rotate(90deg)" : "rotate(270deg)", filter : "invert()", opacity : "0.7", margin : "0", width: "70%", aspectRatio: "1/1" }} />

                </div>
                <div className = "fp-nav-p"  style = {{textAlign : "center", justifyContent : "center", alignItems: "center"}}> <p>Sub-folders</p>
                </div>
                
                <div onClick = {() => {setToggle(!toggle)}} className = "fp-nav-sf-img" style = {{position : "relative", height : "75%", alignItems : "center", justifyContent : "center"}}>
                    <img style = {{height : "85%", aspectRatio : "1/1", opacity : toggle ? "0" : "100"}} src = "bars.png"/>
                    <img style = {{height : "65%", aspectRatio : "1/1", position : "absolute", opacity : toggle ? "100" : "0"}} src = "cross.png"/>
                </div>
            </div>

            <div>
            <div className = "fp-nav-add" onClick={() => {setAvtoggle(!avtoggle)}}>
                <div style = {{position : "relative", display : "flex", height : "55%", alignItems : "center"}}>
                    <img style = {{height : "85%", aspectRatio : "1/1"}} src = "add.png"/>
                </div>
                <p>Add video</p>
            </div>
            <div className = "fp-add-vid-db" style = {{ display : avtoggle ? "flex" : "none", padding : "0px 10px 0px 10px", marginTop : "10px", borderRadius : "5px", width : "180px", position : "relative", flexDirection : "column", position : "absolute", zIndex : "5", backgroundColor : "#373A3E", justifyContent : "center", alignItems : "center"}}>
                <input value = {vn} onChange = {(e) => {setVn(e.target.value)}} style = {{marginTop : "15px", fontSize : "12px",marginBottom : "5px"}} placeholder = "Video name"></input>
                <h4 style = {{margin : "0", marginBottom : "10px", marginTop : "0px", color : "white"}}>-------------</h4>
                <input value = {vl} onChange = {(e) => {setVl(e.target.value)}} style = {{fontSize : "12px",marginBottom : "10px"}} placeholder = "Video url"></input>
                
                <input type="file" onChange = {(e) => {
                    setFile(e.target.files[0]);
                }} className = "upload-vid-input" style = {{width : "0px", height : "0px", position : "absolute"}}></input>
                <button onClick = {() => {document.querySelector('.upload-vid-input').click()}}style = {{marginTop : "5px", width : "60%", backgroundColor : "#26282B", color : "#D1DDE0", fontFamily : "lexend", fontSize : "12px", fontWeight : "300"}}>Upload video</button>
                <h4 style = {{margin : "0", margin : "0", color : "white", fontSize : "12px", fontWeight : "100"}}>{file == null? "" : file.name}</h4>
                <h4 style = {{margin : "0",margin : "5px 0px 10px 0px", marginBottom : "5px", color : "white"}}>-------------</h4>

                <button className = "add-video-button" onClick = {async () =>{
                    
                    let fd = new FormData();
                    let vup = file;
                    if(file!=null) {
                        vup = new File([file], `${localStorage.getItem('username')}&&$${folder}&&$${focus}&&$${file.name}`, {type : file.type})
                    }
                    fd.append('user', localStorage.getItem('username'));
                    fd.append('folder', folder);
                    fd.append('subfolder', focus);
                    fd.append('videoname', vn);
                    fd.append('videolink', vl);
                    fd.append('video', vup)

                    try {
                        const res = await axios.post('/uploadvideo', fd, {
                            headers : {'username' : localStorage.getItem('username')},
                        });
                    }
                    catch(error) {
                        console.log(error);
                    }
                }} style = {{marginBottom : "15px", color : "#FAEBD7", backgroundColor : "#26282B", fontFamily : "lexend", width : "70%",height : "30px"}}>Add</button>
            </div>
            </div>
        </div>

        <div className = "fp-body-wrapper" style = {{position : "relative", right : "5vw", overflow : "hidden", backgroundColor : "transparent", marginTop : "20px", display : "flex", flexDirection : "row", justifyContent : "space-between"}}>
            <div className = "sf-sb" style = {{borderRadius : "5px", color : "white", flexDirection : "column", backgroundColor : "rgba(34, 34, 34, 0.7)", width : "17.5vw", position : "relative", alignItems : "center", justifyContent : "center", border : "0.3px solid rgba(255, 255, 255, 0.4)"}}> 
                <div onClick = {() => {setFolderT(!folderT)}} className = "add-sf" style = {{borderRadius : "3px", marginTop : "15px", backgroundColor : "rgba(92, 94, 167, 0.7)", boxShadow : "rgba(122, 137, 159, 0.7) 0px 0px 100px 0px", display : "flex",  justifyContent : "center", alignItems : "center", gap : "7px", flexDirection : "row", position : "relative", width : "10vw", height : "27px"}}>
                    <div style = {{ display : "flex",  justifyContent : "center", alignItems : "center", position : "relative", aspectRatio : '1/1', height : "100%", }}>
                        <img style = {{height : "60%", aspectRatio : '1/1'}} src = 'add.png'/>
                    </div>
                    <p style = {{display : "flex", justifyContent : "center", alignItems : "center", color : "rgb(220, 230, 245)", fontSize : "85%"}}>Add a Folder</p>
                </div>
                
                <div className = "add-sf-db" style = {{ display : folderT ? "flex" : "none", backgroundColor : "rgba(0, 0, 0, 0.4)", width : "100%", flexDirection : "column"
                
                ,position : "relative", marginTop : "20px", alignItems : "center", justifyContent : "center"}}>
                    <input value = {sfn} onChange = {(e) => {setSfn(e.target.value)}} placeholder = "Folder Name" style = {{backgroundColor : "rgba(255, 255, 255, 0.8)",
                        width : "60%", color : "black", height : "25px", borderRadius : "5px", outline : "none", shadow : "none", border : "none", paddingLeft : "10px", fontFamily : "lexend"
                    }}></input>
                    <button onClick = {async (e) => {
                        // let formdata = new FormData();
                        // formdata.append('username', localStorage.getItem('username'));
                        // formdata.append('folder', folder);
                        // formdata.append('subfolder', sfn);
                        let res = await fetch('/createsf', {
                            method : 'POST',
                            headers : {
                                'Content-type': 'application/json'
                            },
                            body : JSON.stringify({'username' : localStorage.getItem('username'), 'folder' : folder, 'subfolder' : sfn})
                        })
                        if(!res.ok) {
                            alert("error occured");
                        }
                        else {
                            window.location.reload();
                        }
                    }} style = {{marginTop : "10px", width : "25%", padding : "0", marginBottom : "10px", backgroundColor : "rgba(0, 30, 0, 0)", border : "white 1px solid", display : "flex", alignItems:"center", justifyContent : "center", textAlign : "center"}}>add</button>
                </div>
                <p style = {{padding : "0", margin : "5px 0 5px 0"}}>------------</p>
                <SubFolders subfolders={subfolders} setFocus = {setFocus} focus= {focus}/>
            </div>

            
            <div className = "vids" style = {{marginTop : "15px", backgroundColor : "transparent", width : "60vw"}}>
                {videos == null ? (null) : (videos.map((v, i) => (
                    <Video vidname={v.videoname} src = {v.src} key= {i}/>
                )))}


            </div> 

        </div>
    </div>)
}