const app = require('express')();
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
    });
  const http = require('http').Server(app);
const io = require('socket.io')(http);
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
