const socket = io()

//recieve event from server
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height 
    const visibleHeight = $messages.offsetHeight

    //Height of message container 
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//elmentes
const $messageForm = document.querySelector('#socketForm')
const $messageFormInput = $messageForm.querySelector('#input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (message)=> {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('locationMessage', (locationObj) => {
    // console.log(url?)
    const html = Mustache.render(locationTemplate, {
        username: locationObj.username,
        location: locationObj.location,
        createdAt: moment(locationObj.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)   
    autoScroll()
})

socket.on('roomData', ({room,users}) => {
   const html = Mustache.render(sideBarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})
// socket.on('sendLocation', (locationObject) => {
//     console.log(locationObject.latitude, locationObject.longitude)
// })

document.querySelector('#socketForm').addEventListener('submit', (e) => {
    //disable form
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    // let message = document.querySelector('#message').value
    const message = e.target.elements.message.value
    // console.log(message)
    socket.emit('messageSent', message, (error) => {
        //enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

// document.querySelector('#increment').addEventListener('click', () => {
//     // console.log('Clicked')
//     socket.emit('increment')
// })

//geolication
document.querySelector('#send-location').addEventListener('click', () => {
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        $locationButton.removeAttribute('disabled')
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, (error) => {
            if(error){
                return console.log(error)
            }
            console.log('Location shared')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})