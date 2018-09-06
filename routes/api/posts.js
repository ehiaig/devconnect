const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Bring our Post Model
const Post = require("../../models/Post");
//Bring our Profile Model
const Profile = require("../../models/Profile");

//Validate Post Input
const validatePostInput = require("../../validation/post");

//@route GET api/posts/test
//@desc gets all tests
//@acccess is public
router.get("/test", (req, res) => res.json({ msg: "Posts works" }));

//@route POST api/posts
//@desc Create a new post
//@acccess is Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Get all the fields in the profile
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

//@route GET api/post
//@desc Get one post
//@acccess is Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ Nopostsfound: "No posts found" }));
});

//@route GET api/post/:id
//@desc Get post by id
//@acccess is Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ Nopostfound: "No post found with that ID" })
    );
});

//@route DELETE api/posts/:post_id
//@desc Delete post
//@acccess is Private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              Unauthorized: "User not authorized to delete this post"
            });
          }
          //Delete post
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ PostNotFound: "No Post found" }));
    });
  }
);

//@route POST api/posts/like/:post_id
//@desc Like a post
//@acccess is Private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          //Check for post owner
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "User already like this post" });
          }
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ PostNotFound: "No Post found" }));
    });
  }
);

//@route POST api/posts/unlike/:post_id
//@desc Unlike a post
//@acccess is Private
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          //Check for post owner
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notLiked: "You have not yet like this post" });
          }
          //Get index of the like to be removed
          const removeLikeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice out of array
          post.likes.splice(removeLikeIndex, 1);

          //Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ PostNotFound: "No Post found" }));
    });
  }
);

//@route POST api/posts/comment/:post_id
//@desc Add comment to a post
//@acccess is Private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        //Add comments
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ postNotFound: "Post doesn't exist" })
      );
  }
);

//@route DELETE api/posts/comment/:post_id/:comment_id
//@desc Delete comment from a post
//@acccess is Private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        //Check to see if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist" });
        }
        //Get index of the like to be removed
        const removeCommentIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //Splice out of array
        post.comments.splice(removeCommentIndex, 1);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ postNotFound: "Post doesn't exist" })
      );
  }
);
module.exports = router;
