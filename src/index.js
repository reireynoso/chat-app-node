const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

// let count = 0
//connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    //send event from server, emit, name of event
    // socket.emit('countUpdated', count)
    
    socket.on('join', (options, callback) => {

        const {error,user} = addUser({
            id: socket.id,
            ...options
        })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!')) 
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`)) //emits to all connections except local
        // io.to.emit, socket.broadcast.to.emit
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })

    socket.on('messageSent', (message,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    socket.on('sendLocation', (locationObject,callback) => {
        const user = getUser(socket.id)
        let location = `https://google.com/maps?q=${locationObject.latitude},${locationObject.longitude}`
        if(locationObject === null){
            callback('Something went wrong')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location))
        callback()
    })
    //disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })
    // //listen for event
    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated', count) //emits to particular connection, single
    //     io.emit('countUpdated', count) //emits to all connections, all
    // })
})



server.listen(port, () => {
    console.log('Server is on ' + port)
})