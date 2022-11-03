const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { 
    userJoin, 
    getCurrentUser, 
    userLeave, getRoomUsers
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Variables
/*
var typing = false;
var timeout = undefined;
*/

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Feildcrew Bot ';


// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome To FeildCrew Chat!'));

    // Broadcast when a user Connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));
    console.log(`New Connecton from (${user.username}) Has Joined ${user.room}`)

    // send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room, 
        users: getRoomUsers(user.room)
    });

    });


    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
     const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit(
            'message', 
            formatMessage(botName, `${user.username} has left the chat!`)
            );
            console.log(`(${user.username}) has left and disconnected`)

            // send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room, 
        users: getRoomUsers(user.room)
    });
        }

    });
});

// Check if a user is typing
/*
function timeoutFunction(){
    typing = false;
    socket.broadcast.emit('no longer typing');
}
function onKeyDownNotEnter(){
    if(typing == false) {
        typing = true
        socket.emit('user is typing');
        timeout = setTimeout (timeoutFunction, 5000);
    } else {
        clearTimeout(timeout);
        timeout = setTimeout (timeoutFunction, 5000);
    }

}
*/

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

