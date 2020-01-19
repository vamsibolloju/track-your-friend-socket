const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, { origins: '*:*'});
const port = 3000;

const userSockets = {};


io.on('connection', socket => {
    console.log(' connection ', socket.id);
    let current_user_name;
    socket.on('start', (user_name) => {
        console.log(user_name, socket.id);
        current_user_name = user_name;
        const previous_socket = userSockets[user_name];
        if(previous_socket){
            previous_socket.disconnect(`Another socket created for this user!`);
        }
        userSockets[user_name] = socket;
    });

    socket.on('fetchLocation', (friend_name) => {
        console.log(`${current_user_name} wants to locate ${friend_name}`);
        userSockets[friend_name].once('responseLocation', location => {
            socket.emit('responseLocation', {  location, friend_name : current_user_name } );
        });
        userSockets[friend_name].emit('requestLocation', current_user_name);           
    })

    socket.on('disconnect', (reason) => {
        console.log( `Socket ${socket.id} is closed due to ${reason}`);
    });

    /*
    setTimeout(() => {
        socket.disconnect('Timed out!');
    }, 3000);
    */
});

http.listen(port, ( ) => {
    console.log(`started on ${port}`)
});
