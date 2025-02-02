import React, { useRef, useState, useEffect  } from 'react';
import { ScrollView,View, Image, TextInput, Button, StyleSheet, TouchableOpacity, TVFocusGuideView, Text, Pressable } from 'react-native';
import Video,{VideoRef} from 'react-native-video'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { createStaticNavigation, NavigationContainer, useNavigation, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/core';
import VideoPlayer, { type VideoPlayerRef } from 'react-native-video-player';
import { Form } from 'react-router-dom';
import { TVEventHandler, useTVEventHandler, HWEvent } from 'react-native';
import Subtitles from 'react-native-subtitles'
import SrtParser from 'srt-parser-2';



const convertTimeToSeconds = (timeString : string) => {
  const [hh, mm, ss, ms] = timeString.split(/[:,]/);
  return (
    parseInt(hh) * 3600 +
    parseInt(mm) * 60 +
    parseInt(ss) +
    parseInt(ms) / 1000
  );
};

function Login({setLoggedin} : {setLoggedin : (value:boolean) => void}) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  let inputRef1 = useRef<TextInput>(null);
  let inputRef2 = useRef<TextInput>(null);

  const focusInput1 = () => {
    if (inputRef1.current) {
      inputRef1.current.focus();
    }
  };

  const focusInput2 = () => {
    if (inputRef2.current) {
      inputRef2.current.focus();
    }
  };

  return (
    <TVFocusGuideView style={styleslogin.container}>
      <TVFocusGuideView style={styleslogin.inputContainer}>
        <TextInput value = {username} onChangeText = {(text) => {setUsername(text)}} ref={inputRef1} style={styleslogin.input} placeholder="username" />
        <Pressable
          onPress={() => {
            focusInput1();
            console.log('pressed f');
          }}
          style={styleslogin.button}
          hasTVPreferredFocus={true}
        >
          <Text style={styleslogin.buttonText}>press</Text>
        </Pressable>
      </TVFocusGuideView>

      <TVFocusGuideView style={styleslogin.inputContainer}>
        <TextInput value = {password} onChangeText = {(text) => {setPassword(text)}} ref={inputRef2} style={styleslogin.input} placeholder="password" />
        <Pressable
          onPress={() => {
            focusInput2();
            console.log('pressed s');
          }}
          style={styleslogin.button}
        >
          <Text style={styleslogin.buttonText}>press</Text>
        </Pressable>
      </TVFocusGuideView>
      <TouchableOpacity style={{ backgroundColor: "black", width: 150, height: 30, justifyContent: "center", alignItems: "center" }} onPress={async () => {
         console.log("submit clicked")
               const response = await fetch('http://192.168.1.18:5000/login', {
                 
                 method : 'POST',
                 headers: {
                   'Content-type': 'application/json',
                 },
                 body: JSON.stringify({ username: username, password: password }),
               });
               console.log(response.ok)
               if(response.ok) {
                 const data = await response.json();
                 console.log(data)
                 if(data) {
                   // console.log(data);
                   await AsyncStorage.setItem('username', username);
                   await AsyncStorage.setItem('accessToken', data.accesstoken);
                 }
               }
               let checkToken = async () => {
               console.log("submit clicked2")
                 
               const token = await AsyncStorage.getItem('accessToken');
               const user = await AsyncStorage.getItem('username');
               try {
                 const response2 = await fetch('http://192.168.1.18:5000/checkTok', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({ accesstoken: token, username : user })
                   
                 });
         
                 if(!response2.ok) {
                   console.log(response2)
                   await AsyncStorage.setItem('username', "");
                   await AsyncStorage.setItem('accessToken', "");
               console.log("submit clicked34")
         
                   return;
                 }
                 //here, we gotta put await async storage set item accesstoken, for testing purposes gonna make it so i gotta log in on every reload
                 let data2 = await response2.json();
                 if(data2) {
               console.log("submit clicked3")
         
                   await AsyncStorage.setItem('data', JSON.stringify(data2));
                   setLoggedin(true);
                   console.log("asf")
                 }
                 
         
               }
               catch (error) {
                 console.log("Error while logging in : " + error);
               }
               
             }
             checkToken();
      }}>
          <Text style={{ color: "white" }}>Login</Text>
      </TouchableOpacity>
    </TVFocusGuideView>
  );
}

const styleslogin = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    // marginBottom: 40,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    width: 200,
    marginBottom: 10,
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    position : 'absolute',
    opacity : 0
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

type RootStackParamList = {
  home: undefined; 
  main: { showName: string }; 
  player : {src : string};
};


// type MainScreenRouteProp = RouteProp<RootStackParamList, 'main'>;

// interface MainScreenProps {
//   route: MainScreenRouteProp;
// }
interface Subtitle {
  id: string;
  startTime: string;
  startSeconds: number;  
  endTime: string;
  endSeconds: number;   
  text: string;
}
function Player({ route }: { route: RouteProp<RootStackParamList, 'player'> })  {
  const { src } = route.params;
  let [url, setUrl] = useState("");
  const [subtitles, setSubtitles] =  useState<Subtitle[]>([]); 
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let func = async () => {
      let accessToken = await AsyncStorage.getItem("accessToken");
      if(src.charAt(0) == '/') {
        console.log("aaya : " + `http://192.168.1.18:5000${src}/${accessToken}`)
        setUrl(`http://192.168.1.18:5000${src}/${accessToken}`)
      }
      else {
        setUrl(src);
      }
    }
    func()
    
  }, [])

  useEffect(() => {
    const fetchSrtFile = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://192.168.1.18:5000/sub');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const srtFileContent = await response.text();
        
        const parser = new SrtParser();
        const parsedSubtitles = parser.fromSrt(srtFileContent);
        
        // Log the parsed subtitles properly
        console.log('Parsed subtitles:', JSON.stringify(parsedSubtitles, null, 2));
        
        setSubtitles(parsedSubtitles);
        setLoading(false);
        
        // Debug log after state update
        setTimeout(() => {
          console.log('Current subtitles state:', JSON.stringify(subtitles, null, 2));
        }, 100);
      } catch (error) {
        console.error('Error fetching or parsing SRT file:', error);
        setLoading(false);
      }
    };

    fetchSrtFile();
  }, []); // Empty dependency array means this runs once on mount

  // Debug useEffect to monitor subtitle state changes
  useEffect(() => {
    console.log('Subtitles state updated. Current subtitles:', JSON.stringify(subtitles, null, 2));
    console.log('Number of subtitles:', subtitles.length);
  }, [subtitles]);

  
  let [play, setPlay] = useState(true);
  const videoRef = useRef<VideoPlayerRef>(null);
  const [ppb, setPpb] = useState(true);
  const [volume, setVolume] = useState(1);
  let [viz, setViz] = useState(true);
  let [ts, setTs] = useState(0)
  let [duration, setDuration] = useState(0);
  let [st, setSt] = useState<String | null>(null)

  const [lastEventType, setLastEventType] = useState("");

  const myTVEventHandler = (evt:HWEvent) => {
    console.log(evt.eventType)
    setLastEventType(evt.eventType)
    };
    useTVEventHandler(myTVEventHandler);

    // useEffect(()=>{console.log(lastEventType)},[lastEventType])
    useEffect(() =>  {
      if(viz && lastEventType == 'up') {
        setViz(false);
        
      }
      else if(!viz) {
        if(lastEventType == 'down') {
          setViz(true)
        }
        else if(lastEventType == 'left') {
            let newt = ts - 10;
            if(ts < 0) {newt = 0}
            videoRef.current?.seek(newt);
            setLastEventType(""); 
        }
        else if(lastEventType == 'right') {
          let newt = ts + 10;
          if(duration < newt) {newt = duration}
          videoRef.current?.seek(newt);
          setLastEventType("");
        }
      }
      // if(!viz && lastEventType === 'left') {
      //   let newt = ts - 10;
      //   if(ts < 0) {newt = 0}
      //   videoRef.current?.seek(newt);
      //   setLastEventType(""); 
      //   return;
      // }
      // if(!viz && lastEventType === 'right') {
      //   let newt = ts + 10;
      //   videoRef.current?.seek(newt);
      //   setLastEventType(""); 
      //   return;
      // }
      // if(viz && lastEventType != "") {
      //   if(lastEventType === 'up') {
      //     setViz(false);
      //   }
        
      // }
      // if(!viz && lastEventType != "") {
        
      //   setViz(true);
      //   // setPpb(true);
      // }
    },[lastEventType])
  
  useEffect(() => {
    videoRef.current?.setVolume(1);
  }, [videoRef])

  const findSubtitle = React.useCallback((currentTime: number) => {
    return subtitles.find(
      sub => currentTime >= sub.startSeconds && currentTime <= sub.endSeconds
    );
  }, [subtitles]);
 
  return (
    <TVFocusGuideView style={{ backgroundColor : '#222222', position : 'relative', width : '100%', height : '100%' }}>

      {/* Touchable area to pause/play the video */}
      {/* <TouchableOpacity
        hasTVPreferredFocus={true}
        onPress={() => {
          if (play) {
            videoRef.current?.pause();
            setPlay(!play);
          } else {
            videoRef.current?.resume();
            setPlay(!play);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 10,
          left: 0,
          top: 0,
          backgroundColor: 'transparent', // Make it invisible but clickable
        }}
      /> */}

<TVFocusGuideView autoFocus = {true} style={{
      opacity : viz ? 1 : 0,
      width: '90%',
      height: 70,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius : 5,
      position: 'absolute', 
      bottom: 20, 
      left: '5%', 
      zIndex : 20,
      display : 'flex',
      justifyContent : 'center',
      paddingRight : 20,
      alignItems : 'center', flexDirection : 'row'
  }}>
    
    <View style = {{backgroundColor : 'transparent', width : '75%', height : 30, display : 'flex', justifyContent : 'center', alignItems : 'center', flexDirection : 'row'}}><Text style = {{color : 'white', justifyContent : 'center', display : 'flex', alignItems : 'center', textAlign : 'center'}}>{Math.floor(ts/3600)}:{Math.floor((ts%3600)/60)}:{Math.round(ts)%60}</Text><View style = {{width : '70%', height : 7, backgroundColor : 'white', marginLeft : 10, marginRight : 10, position : 'relative', display : 'flex', justifyContent : 'flex-start', alignItems : 'center', flexDirection : 'row'}}><View style = {{backgroundColor : 'red', width : `${ts/duration*100}%`, height : 8}}></View></View><Text style = {{color : 'white', width : 50}}>{Math.floor(duration/3600)}:{Math.floor((duration%3600)/60)}:{Math.round(duration) % 60}</Text></View>

    <TouchableOpacity hasTVPreferredFocus = {ppb} onBlur={() => {setPpb(false)}} onPress={() => {
      if(play) {
        videoRef.current?.pause();
        setPlay(!play)
      }
      else {
        videoRef.current?.resume();
        setPlay(!play)
      }
    }} style = {{width : 100, height : 40, backgroundColor : 'rgba(0, 0, 0, 0.8)', borderRadius : 3, paddingLeft : 10, paddingRight : 10, paddingTop : 10, paddingBottom : 10, display : 'flex', justifyContent : 'center', alignItems : 'center'}}><Text style = {{color : 'white',  display : 'flex', justifyContent : 'center', alignItems : 'center'}}>{play? "pause" : "play"}</Text></TouchableOpacity>
    <TVFocusGuideView style = {{width : 120, height : 40, backgroundColor : 'rgba(0, 0, 0, 0.8)', borderRadius : 3, paddingLeft : 10, paddingRight : 10, paddingTop : 10, paddingBottom : 10, display : 'flex', justifyContent : 'space-between', position : 'relative', alignItems : 'center', flexDirection : 'row'}}><TouchableOpacity onPress = {() => {if(volume > 0) {videoRef.current?.setVolume(volume - 0.2); setVolume(volume - 0.2)}}} style = {{height : 40, width : '10%', display : 'flex', justifyContent : 'center', alignItems : 'center'}}><Text style = {{color : "white", fontSize : 30}}>-</Text></TouchableOpacity><Text style = {{width : '80%', color : 'white',  display : 'flex', justifyContent : 'center', alignItems : 'center',textAlign : 'center'}}>Volume</Text><TouchableOpacity onPress = {() => {if(volume < 1) {videoRef.current?.setVolume(volume + 0.2); setVolume(volume + 0.2)}}} style = {{height : 40, width : '10%', display : 'flex', justifyContent : 'center', alignItems : 'center'}}><Text style = {{color : "white", fontSize : 20}}>+</Text></TouchableOpacity></TVFocusGuideView>
</TVFocusGuideView>

      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: String(url) }}
        
        onProgress={( {currentTime}) => {setTs(currentTime); let subtitle = findSubtitle(currentTime); setSt(subtitle?.text || null);}}
        
        onLoad={({duration}) => setDuration(duration)}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Bottom red bar with volume and audio/subtitles buttons */}
      <View style={{ position: 'absolute', zIndex: 20, left: '10%', bottom: viz ? 100 : 35, width: '80%', height: 45, backgroundColor: 'rgba(0, 0, 0, 0)', justifyContent: 'center', alignItems: 'center' }}>
   {/* <Subtitles currentTime={ts} selectedsubtitle={{ file: 'http://192.168.1.18:5000/sub' }} /> */}
   <Text style = {{ backgroundColor: st != null?  'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)', paddingBottom : 5, paddingTop : 5,paddingLeft : 10, paddingRight : 10, color : 'white', fontSize : 17, borderRadius : 3}}>{st}</Text>
</View>

    </TVFocusGuideView>
  );
}
function Main({ route }: { route: RouteProp<RootStackParamList, 'main'> }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { showName } = route.params;
  let [sf, setSf] = useState<string[] | null>(null);
  let [videos, setVideos] = useState<{videoname : string, src : string}[] | null>(null);
  const fetchVideos = async (subfolder: string) => {
    let username = await AsyncStorage.getItem('username')
    try {
      const res = await fetch('http://192.168.1.18:5000/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: username,
          folder: showName,
          subfolder: subfolder,
        }),
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      // Read the response body once
      const responseText = await res.text(); // Use `.text()` to get the raw response
  
      console.log("Response text:", responseText);
      const data = JSON.parse(responseText); // Now safely parse the JSON
      setVideos(data); // Set your videos state
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  useEffect(() => { 
    const fetchData = async () => {
      let username = await AsyncStorage.getItem('username')
      try {
        const res = await fetch('http://192.168.1.18:5000/subfolders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: username,
            folder: showName,
          }),
        });
  
        if (!res.ok) {
          console.log("error in getting subfolders");
          return;
        }
  
        
        const responseText = await res.text();  // Use `.text()` to get the raw response
        console.log("Response text:", responseText);
  
        
        const data = JSON.parse(responseText);
        setSf(data);  // Assuming the data is already in an array format
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [showName]);
  

  return (
    // <View>
    //   <Text>Wow, {showName} is awesome.</Text>
    // </View>
    <TVFocusGuideView
  style={{
    backgroundColor: "#222222",
    display: "flex",
    flexDirection: "row",
    width: "100%",
    minHeight: "100%",
  }}
>
  <ScrollView style={{ width: "30%", borderRadius : 5, backgroundColor: "#525252", marginLeft : 30, marginTop : 30, paddingLeft : 10, paddingTop : 10}}>
    <Text style = {{color : 'white', fontSize : 17}}>Subfolders</Text>
    <TVFocusGuideView
      style={{
        marginTop: 20,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {sf == null
        ? null
        : sf.map((f, i) => (
            <TouchableOpacity style = {{borderRadius : 2, marginBottom : 10, backgroundColor : '#7E97CB', paddingLeft : 10, paddingRight : 10, paddingTop : 5, paddingBottom : 5, width : '80%', display : 'flex', justifyContent : 'center', alignItems : 'center'}} onPress={() => fetchVideos(f)} key={i}>
              <Text>{f}</Text>
            </TouchableOpacity>
          ))}
    </TVFocusGuideView>
  </ScrollView>

  <ScrollView style={{ width: "70%", marginTop : 30, paddingTop : 10 }}>
    <Text style = {{color : 'white', fontSize : 17, marginLeft : 40}}>Videos</Text>
    <TVFocusGuideView
      style={{
        marginTop: 50,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {videos == null
        ? null
        : videos.map((f, i) => (
            <TouchableOpacity
            style = {{backgroundColor : 'grey', borderRadius : 3, marginBottom : 15, paddingRight : 10, paddingLeft : 10, paddingBottom : 5, paddingTop : 5, width : '50%'}}
              onPress={() => navigation.navigate("player", { src: f.src })}
              key={i}
            >
              <Text>{f.videoname}</Text>
            </TouchableOpacity>
          ))}
    </TVFocusGuideView>
  </ScrollView>
</TVFocusGuideView>

  );
}


function Folder({i, folderName, imgUrl, accessToken }: {i : Int32, folderName: String, imgUrl: String, accessToken: String }) {
  let [opacity, setOpacity] = useState(1);
  let [img, setImg] = useState<String>("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if(imgUrl.charAt(0) == '/') {
      setImg(`http://192.168.1.18:5000${imgUrl}/${accessToken}`);
    }
    else {
      setImg(imgUrl);
    }
  }, [])

  return (
    <Pressable 
      style={{ opacity: opacity, marginTop : 5, marginBottom : 5, marginLeft : 10, marginRight : 10 }} 
      onFocus={() => { setOpacity(0.5) }} 
      onBlur={() => setOpacity(1)}
      onPress={() => { console.log("clicked " + folderName);
        navigation.navigate('main', { showName: String(folderName) });
       }}
    >
      <Image style = {{width:100, aspectRatio:16/9}} source={{uri : String(img)}} />
      <Text style = {{color : 'white'}}>{folderName}</Text>
    </Pressable>
  );
}

function Home({ setLoggedin} : {setLoggedin : (value : boolean) => void}) {
  const [data, setData] = useState<{ foldername: String, img: String }[] | null>(null);
  const [accessToken, setAccessToken] = useState(""); 
  let [sea, setSea] = useState<string>("");
  let [dat, setDat] = useState<{ foldername: String, img: String }[] | undefined>(undefined);
  let [inv, setInv] = useState(true)
  let [sc, setSc] = useState(1);
  useEffect(() =>{
    setDat(data?.filter((fo) => 
      fo.foldername.toLowerCase().includes(sea.toLowerCase())))
  }, [sea, data])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const temp = await AsyncStorage.getItem('data');
        if (temp) {
          console.log("temp " + temp);
          const parsedData = JSON.parse(temp);
          setData(parsedData);
        }

        const token = await AsyncStorage.getItem("accessToken");
        setAccessToken(token || ""); 
        console.log("accessToken " + token);
      } catch (error) {
        console.log('Error retrieving data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, []);
  let searchRef = useRef<TextInput>(null);

  return (
    <TVFocusGuideView style = {{backgroundColor : '#222222', minHeight : '100%', width : '100%', position : 'relative'}}>
      <TVFocusGuideView style = {{ paddingLeft : 30, paddingRight : 30, marginTop: 10, position : 'relative', height : '6%', marginBottom : 50, display : 'flex', flexDirection : 'row', justifyContent : 'space-between' }}>
        <TouchableOpacity onFocus = {() => {setInv(false)}} onBlur={() => {setInv(true)}} onPress= {() => {console.log('pressed'); searchRef.current?.focus()}} style = {{backgroundColor : 'grey', width : '50%', height : 30, paddingLeft : 10, display : 'flex', justifyContent : 'center', alignItems : 'center'}}>
          <Text style = {{color : sea == "" ? 'rgba(255, 255, 255, 0.8)' : 'white'}}>{sea == "" ? "search" : sea}</Text>
          <TextInput ref = {searchRef} value = {sea} onChangeText={(newsea) => {setSea(newsea)}} style = {{zIndex : -5, color : 'white', backgroundColor : 'transparent', position : 'absolute', display : inv ? 'none' : 'flex', height : 20, width : '50%', fontSize : 10}} placeholder='search'></TextInput>
        </TouchableOpacity>
        
        {/* <TVFocusGuideView style = {{display : 'flex', justifyContent : 'center', alignItems:'center', width : '50%', height : '100%', backgroundColor : 'grey'}}>
          <TouchableOpacity></TouchableOpacity>
        </TVFocusGuideView> */}
        <TouchableOpacity onPress = {async() => {
          await AsyncStorage.setItem("data", "");
          await AsyncStorage.setItem("accessToken", "");
          await AsyncStorage.setItem("username", "");
          setLoggedin(false);

        }} style = {{height : '100%'}}>
          <Text style = {{height : 40, fontSize : 15, paddingLeft : 10, paddingRight : 10, paddingTop : 10, paddingBottom : 10, color : 'white', backgroundColor : 'grey', borderRadius : 3 }}>Log out</Text>
        </TouchableOpacity>
      </TVFocusGuideView>
      <ScrollView contentContainerStyle={{ width : '100%', display :'flex', alignItems : 'center', justifyContent:'center', flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 }}>
        <TVFocusGuideView style={{ flexDirection: 'row', flexWrap: 'wrap', width: '90%' }}>
          {
          Array.isArray(dat) ? (
            dat.map((f, i) => (
              <Folder 
                accessToken={accessToken} 
                imgUrl={f.img} 
                folderName={f.foldername} 
                key={String(f.foldername)} i = {i}
                
              />
            ))
          ) : (null)}
        </TVFocusGuideView>
      </ScrollView>
    </TVFocusGuideView>
  );
}


function Wrapper() {
  let [loggedin, setLoggedin] = useState<boolean | null>(null);

  useEffect(() => {
        console.log("here")
        const checkToken = async () => {
          const token = await AsyncStorage.getItem('accessToken');
          const user = await AsyncStorage.getItem('username');
          console.log(token)
          try {
            const response = await fetch('http://192.168.1.18:5000/checkTok', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accesstoken: token, username : user })
              
            });
         
            if(!response.ok) {
              await AsyncStorage.setItem('username', "");
              await AsyncStorage.setItem('accessToken', "");
              setLoggedin(false);
              return;
            }
            let data = await response.json();
            if(data) {
              
            
              await AsyncStorage.setItem('data', JSON.stringify(data));
    
             
            
              console.log(await AsyncStorage.getItem('data')); 
    
              // console.log(AsyncStorage.setItem('data', JSON.stringify(data)))
              setLoggedin(true);
            }
          }
          catch (error) {
            console.log("Error while logging in : " + error);
          }
        }
        checkToken()
      }, [])

      return(
        <TVFocusGuideView style = {{width : "100%", height : "100%", justifyContent : "center", alignItems : "center"}}>
         {!loggedin ? (<Login setLoggedin = {setLoggedin}/>) : (<Home setLoggedin={setLoggedin} />)}
        </TVFocusGuideView>
      );
    
}


const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName='home'>
      <Stack.Screen name="home" component={Wrapper} options={ {headerShown : false}}/>
      <Stack.Screen name = "main" component={Main} initialParams = {{showName : "xyz"}} options={{headerShown : false}}/>
      <Stack.Screen name = "player" component={Player} initialParams = {{src : "xyz"}} options={{headerShown : false}}/>

    </Stack.Navigator>
  );
}

export default function App() {
  return (<NavigationContainer>
    <RootStack />
  </NavigationContainer>);
}




// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React from 'react';
// import type {PropsWithChildren} from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

// function Section({children, title}: SectionProps): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

// function App(): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;
