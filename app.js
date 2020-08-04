var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var methodOverride = require("method-override");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds.js");
var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");
var flash = require("connect-flash");

// seedDB(); // Seed the database everytime the server starts

//USE FLASH
app.use(flash());

//PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "YelpCamp authentication woooooot",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method")); // methodoverride

//passportJS
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
}); //runs req.user in ALL the routes

//connect to the database
mongoose.connect("mongodb://localhost:27017/yelpCamp", {
  useNewUrlParser: true,
});

mongoose.set("useFindAndModify", false);

//use body parser
app.use(bodyParser.urlencoded({ extended: true }));

//set ejs as default file extension
app.set("view engine", "ejs");

//uses the stylesheet
app.use(express.static(__dirname + "/public"));

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

//start the server
const PORT = process.env.PORT || 3000;
console.log(PORT);
app.listen(PORT, function () {
  console.log("Yelp Camp's Server Has Now Started.");
});

// brew services start mongodb-community
