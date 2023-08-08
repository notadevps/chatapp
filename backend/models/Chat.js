const mongoose = require('mongoose'); 

const Chat = mongoose.Schema({
    msg: {
        type: String, 
        required: [true, 'username is user is required']
    },
    clientId: {
        type: String, 
        required: false
    }, 
    time: {
        required: true, 
        type: String
    }, 
    username: {
        required: true, 
        type: String,
    }
})


module.exports = mongoose.model('chat', Chat);