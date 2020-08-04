var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("../models/user");

// root route
router.get("/", function (req, res) {
  res.render("landingPage");
});

// =============== AUTH ROUTES =========================

//show register form -- SIGNUP
router.get("/register", function (req, res) {
  res.render("register");
});

//Handle data from the form -- SIGNUP
router.post("/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    avatar: req.body.avatar,
    email: req.body.email,
  });

  if (req.body.AdminCode === "WHOLIVESINAPINEAPPLEUNDERTHESEA") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function (err, User) {
    if (err) {
      req.flash("error", err.message);
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Welcome to YelpCamp, " + User.username);
      res.redirect("/campgrounds");
    });
  });
});

// LOGIN GET ROUTE
router.get("/login", function (req, res) {
  res.render("login");
});

//LOGIN POST ROUTE
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

// LOGOUT ROUTE
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Successfully Logged Out");
  res.redirect("/campgrounds");
});

//USER PROFILE ROUTE
router.get("/user/:id", (req, res) => {
  User.findById(req.params.id, function (err, foundUser) {
    if (err) {
      req.flash("error", "User Not Found");
      res.redirect("/campgrounds");
      s;
    }
    res.render("users/show", {
      user: foundUser,
    });
  });
});

// MIDDLEWARE to check if a user is logged in or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash("error", "You need to be logged in.");
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
