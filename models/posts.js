var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'middleman')
var PostSchema = new mongoose.Schema({
  name : {type: String, required: true, trim: true},
  description : String,
  price : Number
});

PostSchema.methods.taxed = function () {
  console.log("taxed");
}
var PostModel = db.model('Post', PostSchema);

exports.model = PostModel;