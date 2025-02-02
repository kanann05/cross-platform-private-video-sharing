require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
// const rawData = fs.readFileSync('./users.json', 'utf8');
const userinfo = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
const multer = require('multer');
const path = require('path');

const app = express();
app.use('/uploadimg', express.static('vidi'));
app.use(express.json());
let PORT = process.env.PORT || 5000;

const storage_img = multer.diskStorage({
  destination: function (req, file, cb) {
    
    let folder = file.originalname.split('&&$')[1];
    let user = file.originalname.split('&&$')[0];
    console.log(folder + " " + user);

  
    const dirPath = path.join(__dirname, 'jsons', user, folder);

  
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        return cb(err); 
      }
      cb(null, dirPath); 
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.split('&&$')[2]); 
  }
});

var storage_video = multer.diskStorage({
  destination : function (req, file, cb) {
    let user = file.originalname.split("&&$")[0];
    let folder = file.originalname.split("&&$")[1];
    let subfolder = file.originalname.split("&&$")[2];
    cb(null, path.join(__dirname, 'jsons', user, folder, subfolder));
  },
  filename : function (req, file, cb) {
    cb(null, file.originalname.split("&&$")[3]);
  }
});

const video_upload = multer ( {storage: storage_video} );
const img_upload = multer({ storage: storage_img }); 

app.use(bodyParser.json());
app.use('/show_imgs', express.static('vidi'))
app.listen(PORT, () => {
  console.log("server has started.");
});



app.post('/uploadvideo', video_upload.single('video'), (req, res, next) => {
  const file = req.file;
  const videoname = req.body.videoname;
  const user = req.body.user;
  const folder = req.body.folder;
  const subfolder = req.body.subfolder;
  const name = req.body.videoname
 
  if(!req.file) {
    //link hai
    require(`${__dirname}/jsons/${user}/${folder}/vid-locs.js`).find(i => i.subfolder === subfolder).details.push({'videoname' : name, 'src' : req.body.videolink});
    
  }

  else {
    require(`${__dirname}/jsons/${user}/${folder}/vid-locs.js`).find(i => i.subfolder === subfolder).details.push({'videoname' : name, 'src' : `/${user}/${folder}/${subfolder}/${req.file.filename}`});

  }
  console.log(require(`${__dirname}/jsons/${user}/${folder}/vid-locs.js`).find(i => i.subfolder === subfolder).details)
  return res.json({"succuess" : true});
  
})
app.post('/uploadimg', img_upload.single('img-file'), (req, res, next) => {
  
  const file = req.file;
  const user = req.body.username;
 let dupfn = require(`./jsons/${req.body.username}/data.js`).find(i => i.foldername === req.body.folderName);
 if(dupfn != undefined) {
  console.log("dupfn.folderName");
  fs.unlinkSync(__dirname + `/jsons/${req.body.username}/${req.body.folderName}/${file.originalname.split("&&$")[2]}`)
  return res.status(405).send('Folder name already exists')
 }

  if(!file) {
    if(req.body.imgUrl === "") {
      return  res.status(401).send('No image passed.')
    }
    // let dup = require(`./jsons/${req.body.username}/data.js`).find(i => i.img === req.body.imgUrl);
    // if(dup != undefined) {
    //   return res.status(402).send('Image url already exists, try changing the url.');
    // }
    require(`${__dirname}/jsons/${req.body.username}/data.js`).push({'foldername' : req.body.folderName, img : req.body.imgUrl});
    fs.mkdir(`${__dirname}/jsons/${req.body.username}/${req.body.folderName}`, {recursive : true}, (err) =>{
      if (err) console.log(err)
        else {
          console.log("done")
        }
    } )

    const content = `let subfolders = []; module.exports = subfolders;`;
    let content2 = `let data = []; module.exports = data;`
let fp2 = path.join(`jsons/${req.body.username}/${req.body.folderName}`, `vid-locs.js`);
fs.writeFile(fp2, content2, (err) => {
  if(err) console.log(err)
})
    

    let fp = path.join(`jsons/${req.body.username}/${req.body.folderName}`, 'subfolders.js');
    fs.writeFile(fp, content, (err) => {
      if (err) {
          console.error('Error writing to file', err);
      } else {
          console.log(`subfolders.js file created successfully`);
      }
    });   // console.log( require(`./jsons/${req.body.username}/data.js`));
    return res.json({"success" : true})
  }
  // let dup3 = require(`./jsons/${req.body.username}/data.js`).find(i => i.img === `/vidi/${file.filename}`);
  // if(dup3 != undefined) {
  //   return res.status(403).send('Image with same name exists');
  // }
  
  require(`${__dirname}/jsons/${req.body.username}/data.js`).push({'foldername' : req.body.folderName,'img' : `/${user}/${req.body.folderName}/${req.file.filename}`}); 
  console.log(require(`${__dirname}/jsons/${req.body.username}/data.js`)) 
  // console.log(require(`./jsons/${req.body.username}/data.js`))
  // console.log( require(`./jsons/${req.body.username}/data.js`));

  // fs.mkdir(`${__dirname}/jsons/${req.body.username}/${req.body.folderName}`, {recursive : true}, (err) =>{
    
  //   if (err) console.log(err)
  //     else {
  //       console.log("done")
  //     }
  // } )
  const content = `let subfolders = []; module.exports = subfolders;`;

  let content2 = `let data = []; module.exports = data;`
  let fp2 = path.join(`jsons/${req.body.username}/${req.body.folderName}`, `vid-locs.js`);
  fs.writeFile(fp2, content2, (err) => {
    if(err) console.log(err)
  })
  
let fp = path.join(`jsons/${req.body.username}/${req.body.folderName}`, 'subfolders.js');
fs.writeFile(fp, content, (err) => {
  if (err) {
      console.error('Error writing to file');
  } else {
      console.log(`subfolders.js file created successfully`);
  }
});
  res.json({"filename" : file.filename});
})

app.post('/videos', (req, res) => {
  let user = req.body.user;
  // console.log(user)
  let folder = req.body.folder;
  let subfolder = req.body.subfolder;

  // console.log("videos madhe aala")
    let obj = require(`${__dirname}/jsons/${req.body.user}/${req.body.folder}/vid-locs.js`).find((s) => s.subfolder === subfolder);
    let details = obj.details;
    // console.log(details);
    if(details != undefined && details != null) {
      // console.log(details)
      res.json(details)
    }
    
})

app.post('/createsf', (req, res) => {
  // console.log(req.body)
  console.log("ala")
  if(fs.existsSync(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/${req.body.subfolder}`)) {
    return res.sendStatus(420);
  }
  fs.mkdir(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/${req.body.subfolder}`, {recursive:true}, (err) => {if (err) return res.sendStatus(400)});
  require(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/subfolders.js`).push(req.body.subfolder);
  require(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/vid-locs.js`).push({'subfolder' : req.body.subfolder, 'details' : []});
  console.log(require(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/subfolders.js`));
  console.log( require(`${__dirname}/jsons/${req.body.username}/${req.body.folder}/vid-locs.js`));
  return res.json({"success" : "true"});
})

app.post('/subfolders', (req, res) => {
  // console.log(req.body)
  let user = req.body.user;
  console.log(user)
  let folder = req.body.folder;
  res.json(require(`${__dirname}/jsons/${user}/${folder}/subfolders.js`));
  // console.log(req.body)
})

app.get('/:user/:folder/:file', (req,res ) => {
  const filePath = path.join(__dirname, 'jsons', req.params.user, req.params.folder, req.params.file);
  res.sendFile(filePath, (err) => {
    console.log("sent static")
    if (err) {
      console.error(err);
      res.sendStatus(409); 
    }
  });
})
app.get('/:user/:folder/:file/:token', (req, res) => {
  const filePath = path.join(__dirname, 'jsons', req.params.user, req.params.folder, req.params.file);
  jwt.verify(req.params.token, process.env.SECRET_KEY, (err, user) => {
    if(err) return res.sendStatus(410)

      res.sendFile(filePath, (err) => {
        console.log("sent")
        if (err) {
          console.error(err);
          res.sendStatus(409); 
        }
      });
  })
})

app.post('/:user/:folder/:file', (req, res) => {
  const filePath = path.join(__dirname, 'jsons', req.params.user, req.params.folder, req.params.file);
  const token = req.body.token;
  // console.log(token)
  jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if(err) return res.sendStatus(410)

      res.sendFile(filePath, (err) => {
        console.log("sent")
        if (err) {
          console.error(err);
          res.sendStatus(409); 
        }
      });
  })

  
});
app.get('/', (req, res) => {
  return res.json({"works" : "fine"})
})

app.get('/:user/:folder/:subfolder/:file/:token', (req, res) => {
  console.log("aala");
  console.log(req.params);

  const filePath = path.join(__dirname, 'jsons', req.params.user, req.params.folder, req.params.subfolder, req.params.file);

  jwt.verify(req.params.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      console.log("wrong user access token");
      return res.status(403).send("Forbidden"); // Proper status for authentication failure
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("sent nahi zala", err);
        if (!res.headersSent) { // Ensure headers haven't already been sent
          return res.status(409).send("File not sent");
        }
      } else {
        console.log("sent");
      }
    });
  });
});

app.get('/sub', (req, res) => {
  res.sendFile(__dirname + '/jsons/admin/OBX/i wonder/sub2.srt')
})


app.post('/:user/:folder/:subfolder/:filename', (req, res) => {
  console.log(req.params);
  
  const filePath = path.join(
    __dirname,
    'jsons',
    req.params.user,
    req.params.folder,
    req.params.subfolder,
    req.params.filename
  );

  const token = req.body.token;
  console.log(token);

  // Uncomment and adjust as needed for JWT verification
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    res.sendFile(filePath, (error) => {
      if (error) {
        console.error("Error sending file:", err);
        if (!res.headersSent) { // Ensure headers haven't already been sent
          res.sendStatus(409);
        }
      } else {
        console.log("File sent successfully");
      }
    });

    if (err) return res.status(410).send('Unauthorized');
  }
);

// res.sendFile(filePath, (error) => {
//   if (error) {
//     console.error("Error sending file:", error);
//     if (!res.headersSent) { // Ensure headers haven't already been sent
//       res.sendStatus(409);
//     }
//   } else {
//     console.log("File sent successfully");
//   }
// });

})






app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = userinfo.find(u => u.username === username);
  if (!user) {
    return res.status(400).send("Cannot find user.");
  }
  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      console.log("Login successful");
      const accessToken = jwt.sign(user, process.env.SECRET_KEY);
      res.json({"accesstoken" : accessToken})
    } else {
      res.status(401).send("Invalid credentials.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.post('/checkTok', (req, res) => {
  console.log(req.body)
  console.log("checktok")
  let tempToken = req.body.accesstoken;
  if(tempToken == null) return res.sendStatus(401)
  jwt.verify(tempToken, process.env.SECRET_KEY, (err, user) => {
    if(err) return res.sendStatus(403)
      console.log(require(`./jsons/${req.body.username}/data.js`))
    res.json(require(`./jsons/${req.body.username}/data.js`))
  })
})
