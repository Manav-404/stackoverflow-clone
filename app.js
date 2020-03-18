const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors')

 const app = express();
 app.use(cors({
     origin : "http://localhost:4200"
 }));

 //Middleware for body parser
 app.use(bodyparser.urlencoded({extended:false}));
 app.use(bodyparser.json())



//bring all routes 
const auth = require('./routes/api/auth');
const questions = require('./routes/api/questions');
const profile = require('./routes/api/profile');

 //mongoDB config
 const db = require('./setup/connectionurl').mongoURL;


 //Attempt to connecet to the DB
 mongoose.connect(db)
 .then(()=>console.log('MongoDb connected successfully'))
 .catch(error=>console.log(error));



 //Passport Middleware
 const passport = require('passport');
 app.use(passport.initialize());

 //Config for JWT strategy
 require("./strategies/jsonwtStrategy")(passport)


 //just for testing --> route 
 app.get('/' , (req ,res)=>{
     res.send("Hey there big stack");
 })


 //actual routes 
 app.use('/api/auth' , auth)
 app.use('/api/questions' , questions)
 app.use('/api/profile' , profile)

 const port = process.env.PORT||3000;

 app.listen(port , () => console.log(`App is running on ${port}....`))