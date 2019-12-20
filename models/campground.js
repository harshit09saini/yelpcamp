var mongoose = require('mongoose'); 

//Setup the campground schema

var campgroundSchema = new mongoose.Schema({
    name: String, 
    image: String,
    price: String, 
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Comment"
    }]
});

// var Campground = mongoose.model("Campground", campgroundSchema);

module.exports = mongoose.model("Campground", campgroundSchema); 