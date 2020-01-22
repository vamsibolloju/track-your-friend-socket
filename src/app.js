const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, { origins: '*:*'});
const port = process.env.PORT || 3000;

const userSockets = {};

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', (req, res)=> {
    return res.end('Track your friend socket api is working...')
});

app.get('/sockets', (req, res) => {
    return res.json(Object.keys(userSockets));
    Object.keys(userSockets).filter( user => userSockets ) 
});

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
        if(userSockets[friend_name]){
            userSockets[friend_name].once('responseLocation', location => {
                socket.emit('responseLocation', {  location, friend_name } );
            });
            userSockets[friend_name].emit('requestLocation', current_user_name);
        }
    })

    socket.on('disconnect', (reason) => {
        delete userSockets[socket.id];
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
