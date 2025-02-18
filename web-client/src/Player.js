import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useLocation } from "react-router-dom";
import SrtParser from 'srt-parser-2';
import axios from 'axios';


export default function Player(props) {
  const [play, setPlay] = useState(false);
  const location = useLocation(); 
  const [subtitles, setSubtitles] =  useState([]); 
  let [subtitle, setSubtitle] = useState("")
  const { src, folder, subfolder, vidname } = location.state;
  const username = localStorage.getItem("username");
  let [srcurl, setSrcurl] = useState(null);
  let [subFile, setSubFile] = useState(null);
  window.addEventListener('popstate', () => {
    if (srcurl) {
      URL.revokeObjectURL(srcurl);
      console.log("Blob URL revoked");
    }
  })
  let [subv, setSubV] = useState(true);
  
  useEffect(() => {
          // console.log(src)
          // console.log(localStorage.getItem("username"));
          // console.log(folder);
          // console.log(subfolder);
          // console.log(vidname);
          // console.log(location.state)
          if(src.charAt(0) == '/') {
              
              let videocall = async () => {
                  try {
                      
                      const response = await fetch(src, {
                          method : 'POST',
                          headers : {'Content-type' : 'application/json'},
                          body : JSON.stringify({'token' : localStorage.getItem("accessToken") })
                      
                      })
                      if(!response.ok) {
                          if(response.status == 401) {
                              console.log("unauth access");
                              return;
                          }
                          setSrcurl(src);
                      }
                      else {
                          const videoBlob = await response.blob(); //appropriate response gets stored in videoBlob
                          const videoObjectURL = URL.createObjectURL(videoBlob); //creating a link to point to videoBlob
                          // console.log(videoObjectURL + vidname);
                          setSrcurl(videoObjectURL) //setting video player's general src url to blob
                      }
                  }
                  catch (error) {
                      
                  }
              }
              videocall();
              
          }
          else {
              setSrcurl(src);
          }
      }, [])
      
      useEffect(() => {console.log(subtitles)
        
      }, [subtitles])

      useEffect(() => {
        const fetchSrtFile = async () => {
          try {
            // setLoading(true);
            // const response = await fetch('/sub');
            const response = await fetch('/sub', {
              method : 'POST',
              headers : {'Content-type' : 'application/json'},
              body : JSON.stringify({"username" : username, "folder" : folder, "subfolder" : subfolder, "filename" : vidname})
            })
            console.log(response)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const srtFileContent = await response.text();
            // console.log(srtFileContent)
            const parser = new SrtParser();
            const parsedSubtitles = parser.fromSrt(srtFileContent);
            console.log(parsedSubtitles)
            
            
            setSubtitles(parsedSubtitles);
            // console.log(subtitles)
            
        
            // setTimeout(() => {
            //   console.log('Current subtitles state:', JSON.stringify(subtitles, null, 2));
            // }, 100);
          } catch (error) {
            console.error('Error fetching or parsing SRT file:', error);
            // setLoading(false);
          }
        };
    
        fetchSrtFile();
      }, []);

      
      // useEffect(() => {
        
      // }, [subtitles])

      function findSubtitle(time) {
        let currentTime = time.playedSeconds;
        return subtitles.find(
          sub => currentTime >= sub.startSeconds && currentTime <= sub.endSeconds
        );
      }
      
  return (
    <div
      className="player-div"
      style={{
        
        backgroundColor: "black",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="info"
        style={{
          visibility: play ? "hidden" : "visible",
          position: "absolute",
          marginLeft: "-60vw",
          marginTop: "0vh",
          color: "white",
          maxWidth: "30vw",
        }}
      >
        <h1>Show name</h1>
        <h2>Episode no</h2>
        <h3>
          Mary had a little lamb, lamb grew up and had a family of his own. Will
          the lamb raise the kids better than Mary?
        </h3>
      </div>
      <div className = "sub-add" style = {{zIndex : 100, visibility: play ? "hidden" : "visible",
          position: "absolute",
          right : '50px', top : '20px',
          color: "white",
          maxWidth: "30vw",}}>
            <input style = {{padding : '0', width : '200px' }} type = "file" onChange={(e) => {setSubFile(e.target.files[0])}}></input>
            <button onClick = {async () => {
              let fd = new FormData();
              let sup = new File([subFile], `${localStorage.getItem('username')}&&$${folder}&&$${subfolder}&&$${vidname}`, { type: "application/x-subrip" }
            );
              fd.append('sub', sup);
              try {
                        const res = await axios.post('/uploadsub', fd, {
                            headers : {'username' : localStorage.getItem('username')},
                        });
                        console.log(res.data)
                    }
                    catch(error) {
                        console.log(error);
                    }
            }}>Upload srt subtitles</button>
          </div>

          <div className = "sub-add" style = {{ 
            opacity : subtitle == undefined ? 0 : 1,
          position: "absolute",
           bottom : '5vw', backgroundColor : 'rgba(0, 0, 0, 0.7)',
          maxWidth : '80vw',
          padding : '5px 8px',
          color: "white"}}>
           {subtitle}
          </div>
      
      <ReactPlayer
        playing={play}
        controls={true}
        onProgress={(progress) => {let subtitlehere = findSubtitle(progress); setSubtitle(subtitlehere?.text || null);}}
        onPlay={() => setPlay(true)} 
        onPause={() => setPlay(false)} 
        className="player"
        width="100%"
        height="100%"
        url={srcurl}
    //     config={{
    //       file: {
    //         tracks: [
    //           {
    //             kind: "subtitles",
    //             src: sub,
    //             srcLang: "en",
    //             default: true
    //           }
    //         ]
    //       }
    //     }
    //   }
      />
    </div>
    
  );
  
}
