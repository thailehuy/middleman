var Post = require('../models/posts.js').model;

exports.index = function(req, res) {
  Post.find({}, function(err, docs) {
    console.log(docs);
  })
  res.render('posts/index', {title: "Posts"});
}