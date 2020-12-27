const mongoose = require('mongoose');
const collection = "users"; 
const schema = new mongoose.Schema({
    name:  String, 
    avatar:String, 
    status: String,
    ordering:   Number, 
    group: {
        id: String, 
        name: String
    }, 
    created : {
      user_id: Number, 
      user_name: String, 
      time: Date
    }, 
    modified : {
      user_id: Number, 
      user_name: String, 
      time: Date
    },
    content: String
  });

module.exports = mongoose.model(collection, schema); 