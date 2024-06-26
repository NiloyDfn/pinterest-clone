const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title : String,
    description : String,
    image : String,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    }
});

module.exports = mongoose.model('Post', postSchema );