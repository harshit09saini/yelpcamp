var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//=========================================
//COMMENTS ROUTES
//=========================================

//Shows a form for comments
router.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});

router.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      req.flash("error", "Something Went Wrong");
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Something Went Wrong");
        } else {
          //add username and id into comments
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          req.flash("success", "Successfully Added the Comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// EDIT COMMENT
router.get(
  "/campgrounds/:id/comments/:comment_id/edit",
  checkOwnership,
  function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          campgroundId: req.params.id,
          comment: foundComment,
        });
      }
    });
  }
);

// UPDATE COMMENT

router.put("/campgrounds/:id/comments/:comment_id", checkOwnership, function (
  req,
  res
) {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment.text,
    function (err, updatedComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/campgrounds/" + req.params.id);
      }
    }
  );
});

// DESTROY COMMENT

router.delete(
  "/campgrounds/:id/comments/:comment_id",
  checkOwnership,
  function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Comment Deleted");
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  }
);

// MIDDLEWARE to check if a user is logged in or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in");
  res.redirect("/login");
}

//MIDDLEWARE to check for ownership
function checkOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        // console.log(foundCampground.author.id); mongoose object
        // console.log(req.user._id) string
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have the permission");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("back");
  }
}
module.exports = router;
