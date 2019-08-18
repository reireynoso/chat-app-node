const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room and required'
        }
    }
    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const match = users.find((user) => user.id === id)
    if(!match){
        return 'No user found with that id'
    }
    return match
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room === room.toLowerCase())
    return usersInRoom
}   

addUser({
    id: 22,
    username: 'Rei',
    room: 'Jersey'
})

addUser({
    id: 42,
    username: 'Kring',
    room: 'New York'
})

addUser({
    id: 69,
    username: 'Kringtina',
    room: 'Jersey'
})
// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(users)
// console.log(getUsersInRoom('jersey'))
// console.log(getUser(69))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}