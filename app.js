const path = require('path');

const express = require('express'); 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {
  v4: uuidv4
} = require('uuid');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();


const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4())
  }
});

const fileFilter = (req, file, cb)=>
{
  if (file.mimetype === 'image/png' ||
  file.mimetype === 'image/jpg'||
  file.mimetype === 'image/jpeg')
  {
    cb(null,true);
  }
  else{
    cb(null,false);
  }
}

//app.use(bodyParser.urlencoded()); 
// this method is applicable for data we receive as x-www-form-urlencoded  
// <form> send data in this format 

app.use(bodyParser.json());
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname,'images')));



app.use((req,res,next)=>{
 res.setHeader("Access-Control-Allow-Origin", "*");
 res.setHeader("Access-Control-Allow-Credentials", "true");
 res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH, DELETE");
 res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
})

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);

app.use((error, req, res, next) => {
console.log(error);
const statusCode = error.statusCode || 500;
const message = error.message; //this is default and i'ts message we self passed
const data = error.data;
res.status(statusCode)
.json({message:message, data:data});
});

mongoose
.connect('')
.then(res=>{
  console.log('Connected!!!')
  const server = app.listen(8080);
/*  const io = require('./socket.io').init(server); //using this because web sockets are build on http web servers
  io.on('connection', socket=>{
    console.log('Client connected!')
  });
  */
})
.catch(err=>console.log(err));


