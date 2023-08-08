const express = require('express'); 
const { createServer } = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const httpServer = createServer(app); 
const mongoose = require('mongoose'); 
const { create } = require('domain');
const User = require('../models/User');
const Chat = require('../models/Chat');
const io = new Server(httpServer, { cors: {
    origin: '*'
}

}); 

app.use(cors());
app.use(express.json());
let onUsers = [];
let typing = [];



io.on('connection', async (socket) => {

    socket.on('typeStart', (d) => { 
        typing.push(d); 
        io.emit('typing', typing)
    });
    socket.on('typeEnd', (d) => {
        typing.splice(d.i, 1);
        io.emit('typing', typing);
    })
    socket.on('userId', async (data) => {
        const idUser =  await User.findById(data._id); 
        if (idUser) {
            let chats = await Chat.find({}); 
            socket.emit('allchats', chats);
            let i = onUsers.findIndex(el => el._id === data._id); 
            if (i < 0) {
                onUsers.push({ username: data.name, _id: data._id, socketId: socket.id }); 
            }
            socket.emit('socketId', {_id: idUser._id});
            console.log(onUsers);
            io.emit('online', onUsers);
        } 
    })
    console.log(socket.id + ' socket connected');
    socket.on('messageClient', async (data) => {
        console.log(data);
        let date = new Date(); 
        let time = `${date.getHours()}:${date.getMinutes()}`;
        let chat = new Chat({
            msg: data.msg, 
            clientId: data.clientId, 
            time: time, 
            username:  data.username
        }); 
        await chat.save(); 
        io.emit('messageResponse', {...data, time: time });
    })
    socket.on('disconnect', () => {
        console.log(socket.id);
        let i = onUsers.findIndex(el => el.socketId === socket.id);
        if (i >= 0) {
            onUsers.splice(i, 1); 
            io.emit('online', onUsers); 
        }

    })
}); 


app.post('/createuser', async (req, res) => {
    try {
        let { username } = req.body; 
        if (!username) return res.status(403).json('missing request paramteres');
        let user = await User.findOne({ username: username }); 
        if (user) {
            return res.status(200).json(user);
        } 

        const newUser = new User({
            username: username
        }); 
        await newUser.save(); 
        return res.status(200).json(newUser);
    } catch (e) {
        console.log(e); 
        return res.status(500).json('Some server error occured');
    }
})




httpServer.listen(8000, () => {
    console.log('app running on port 8000'); 
    mongoose.connect('mongodb+srv://volt:voltTHOR@blogs.habichn.mongodb.net/chat')
    .then(response => console.log('db connected'))
    .catch(err => console.log('error occured while connecting with database'))
})