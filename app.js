require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatApp');

const app = require('express')();

const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');

app.use('/', userRoute);

const io = require('socket.io')(http);
var usp = io.of('user-namespace')

usp.on('connection',async function(socket){
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id:userId }, { $set:{is_online:'1'}});
    console.log('User Connected..');

    // user broadcast online status....
    socket.broadcast.emit('getOnlineUser', { user_id: userId });

    socket.on('disconnect',async function(){
        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({ _id:userId }, { $set:{is_online:'0'}});
        console.log('User Disconnected..');

    // user broadcast offline status....
    socket.broadcast.emit('getOfflineUser', { user_id: userId });

    });

    // Chating implementation..
    socket.on('newChat', function(data){
        socket.broadcast.emit('loadNewChat', data);
    });

    // Load old Chats......
    socket.on('existsChat', async function(data){

        var chats = await Chat.find({ $or:[
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id }
        ]});

        socket.emit('loadOldChats', { chats:chats });
    });

    // Delete Chats......
    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted', id);
    });

    // updated chats.....
    socket.on('chatUpdated', function(data){
        socket.broadcast.emit('chatMessageUpdated', data);
    });
});

http.listen(3000, ()=>{
    console.log("(3000) Server is running...");
});