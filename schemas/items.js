const mongoose = require('mongoose');
const collection = "items"; 
const schema = new mongoose.Schema({
    name:  String, // String is shorthand for {type: String}
    status: String,
    ordering:   Number, 
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