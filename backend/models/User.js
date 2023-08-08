const mongoose = require('mongoose'); 

const User = mongoose.Schema({
    username: {
        type: String, 
        required: [true, 'username is user is required']
    },
    msg: {
        type: mongoose.Types.ObjectId, 
        required: false
    }, 
})


module.exports = mongoose.model('user', User);