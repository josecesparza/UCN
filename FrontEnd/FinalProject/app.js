var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user')

mongoose.connect("mongodb://localhost:27017/notes_app", { useNewUrlParser: true });
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

//PASSPORT CONFIG
app.use(require('express-session')({
    secret: "This is the Secret Page Test",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Require Routes
var notesRoutes = require('./routes/notes');

app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("index");
});

app.use("/notes", notesRoutes);

//========================
//AUTH ROUTES
//========================
//Show register form
app.get("/register", function(req, res){
    res.render("users/register");
});

//Handling sign up logic 
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("users/register");
        }

        passport.authenticate("local")(req, res, function(){
            res.redirect("/notes");
        });
    });
});

app.listen(3000, process.env.IP, function(){
    console.log("Server has started!");
});