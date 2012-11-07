var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'posts')
var PostSchema = new mongoose.Schema({
  id : {type: String, require: true, trim: true, unique: true},
  name : {type: String, required: true, trim: true},
  desc : String,
  price : Number
});

PostSchema.methods.taxed = function () {
  console.log("taxed");
}
var PostModel = db.model('Post', PostSchema);

exports.model = PostModel;