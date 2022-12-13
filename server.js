const express=require('express');
const app=express();
const mongoose= require('mongoose');


const db= require('./config/keys').mongoURL;
const posts= require('./routes/api/posts');
const profile= require('./routes/api/profile');
const users= require('./routes/api/users');


mongoose
    .connect(db)
    .then(()=>console.log("Mongodb connected!"))
    .catch(err=>{console.log(err)});

port= process.env.port || 5000;

app.get('/',(req,res)=>{
    res.send('Hello');
});

app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

app.listen(port,()=>{
    console.log(`App listening on Port: ${port}`);
});