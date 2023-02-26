const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema =new Schema({
    title:{
    type: String,
    required: true
    },
    imageUrl:{
        type:String,
        required: true,
    },
    content:{
        type: String,
        required:true
    },
    creator :{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{timestamps: true}// this will help in automatically 
//creating and updating the time stamp
);

module.exports = mongoose.model('Post',postSchema);