var Post = require('../models/posts.js').model;

exports.index = function(req, res) {
  Post.find({}, function(err, docs) {
    if(err) {
      res.send(err);
    } else {
      res.render('posts/index', {posts: docs, title: "Posts list"});
    }
  })
}

exports.new = function(req, res) {
  res.render('posts/new', {title: "New post"});
}

exports.create = function(req, res) {
  var post = new Post(req.body);
  post.save(function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.redirect('/posts/' + data._id);
    }
  })
}

exports.show = function(req, res) {
  var post = Post.findOne({_id: req.params.id}, function(err, doc) {
    if(err) {
      res.send(err);
    } else {
      res.render('posts/show', {post: doc, title: "Post details"});
    }
  });
}

exports.edit = function(req, res) {
  var post = Post.findOne({_id: req.params.id}, function(err, doc) {
    if(err) {
      res.send(err);
    } else {
      res.render('posts/edit', {post: doc, title: "Edit post"});
    }
  });
}

exports.update = function(req, res) {
  Post.update({_id: req.params.id}, req.body, function(err) {
    if(err) {
      res.send(err);
    } else {
      res.redirect('/posts/' + req.params.id);
    }
  });
}