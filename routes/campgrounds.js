var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// INDEX - Shows all campgrounds
router.get("/campgrounds", function (req, res) {
  //retrieve all the campgrounds from the db
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", { campgrounds: allCampgrounds });
    }
  });
});

//route for the form
//NEW - shows form to create a new campground
router.get("/campgrounds/new", isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

//CREATE
router.post("/campgrounds", isLoggedIn, function (req, res) {
  //get the data from the form
  var location = req.body.location; //campground name
  var image = req.body.image;
  var price = req.body.price;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username,
  };
  var newCampground = {
    name: location,
    price: price,
    image: image,
    description: description,
    author: author,
  };
  //create new campgrounds and save to the DB
  Campground.create(newCampground, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect back to campgrounds
      res.redirect("/campgrounds");
    }
  });
});

//SHOW - displays more information about a selected element from the database
router.get("/campgrounds/:id", function (req, res) {
  //find a campground that matches the ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
  //display info about that campground
});

//EDIT CAMPGROUND

router.get("/campgrounds/:id/edit", checkOwnership, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

//UPDATE CAMPGROUND
router.put("/campgrounds/:id", checkOwnership, function (req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (
    err,
    updatedCampground
  ) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//DESTROY CAMPGROUND
router.delete("/campgrounds/:id", checkOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  });
});

// MIDDLEWARE to check if a user is logged in or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in");
  res.redirect("/login");
}

function checkOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err) {
        req.flash("error", "Campground Not Found");
        res.redirect("back");
      } else {
        // console.log(foundCampground.author.id); mongoose object
        // console.log(req.user._id) string
        if (
          foundCampground.author.id.equals(req.user._id) ||
          req.user.isAdmin
        ) {
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
