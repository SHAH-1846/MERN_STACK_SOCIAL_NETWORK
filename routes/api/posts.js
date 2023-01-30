const express = require("express");
const passport = require("passport");
const router = express.Router();

const Post = require('../../model/Post');
const Profile = require('../../model/Profile');

const validatePostInput = require('../../validation/post');
const profile = require("../../validation/profile");

router.get("/test", (req, res) => {
  res.json({
    Msg: "Post Works",
  });
});


router.get('/', (req,res)=>{
  Post.find()
    .sort({date: -1})
    .then(posts=> res.json(posts))
    .catch(err=> res.status(404).json({noPosts: "No Posts Found!"}));
});

router.get('/:id', (req,res)=>{
  Post.findById(req.params.id)
  .then(post=> res.json(post))
  .catch(err => res.status(404).json({nopost: "No Posts found for this id"}));
});

router.post('/', passport.authenticate('jwt', {session: false}), (req,res) => {

  const {errors, isValid} = validatePostInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    user: req.user.id,
    name: req.body.name,
    avatar: req.body.avatar,
    text: req.body.text,
  });

  newPost.save().then(post => res.json(post));

});

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) => {

  Profile.findOne({user:req.user.id})
    .then(profile => {
      if(!profile){
        return res.json({noProfile: "No Profile found"});
      }

      Post.findById(req.params.id)
        .then(post => {
          if(!post){
            return res.json({noPost: "No post found"});
          };

          if(post.user.toString() !== req.user.id){
            return res.status(401).json({NotAuthorized: "User not authorized"})
          };

          post.remove().then(()=> res.json({success: true}));
        })
        .catch(err => res.json({noPost : " Catch error, No Post found"}));
    })
});

router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) => {

  Profile.findOne({user: req.user.id})
    .then(profile =>{
      Post.findById(req.params.id)
        .then(post => {
          if(
            post.likes.filter(like => like.user.toString() == req.user.id)
              .length>0
            
          ){
            return res.status(400).json({alreadyLiked: "User already liked the post"});
          }

          post.likes.unshift({user: req.user.id});

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({noPost: "Catch error, No Post found"}));
    });
});

router.post('/unlike/:id', passport.authenticate('jwt', {session:false}), (req,res) => {

  Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({notLiked: "You have not yet liked the post"});

          }

          const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

            post.likes.splice(removeIndex, 1);

            post.save().then(post => res.json(post));


          

        })
        .catch(err => res.status(404).json({noPostFound: "Post not found"}));
    })

});

router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req,res) => {

  const {errors,isValid} = validatePostInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment ={
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({postNotFound: "No Post Found" }));
});

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session:false}), (req,res) =>{
  Post.findById(req.params.id)
    .then(post => {
      if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
        return res.status(400).json({commentNotExist: "Comment does not exists"});
      }

      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

  
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));


    })
    .catch(err => res.status(404).json({postNotFound: "Post not found"}));
});






module.exports= router;
