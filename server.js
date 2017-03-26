var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var expressSession = require('express-session');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(expressSession({
  secret: 'thisIsASecret',
  resave: false,
  saveUninitialized: false
}));;
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

// Our browser sends the cookie data when we visit the site as part of the request headers.
// If passport finds that the session ID sent by our browser matches a session ID then it needs
// to deserialize the data.
// This allows passport to decrypt the session ID
// and the user information that was stored
// is placed in a property called 'user' on the request body.
// otherwise (i.e, not deserealizing) we will have an error: "Failed to deserialize user out of session"
passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/success', function(req, res) {
  //res.send("Hey, hello from the server!");
  if (req.isAuthenticated()) {
    res.send('Hey, ' + req.user + ', hello from the server!'); // changed success route after deserializing
  } else {
    res.redirect('/login'); // handle unauthorized access
  }
});

app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/public/login.html');
});


// the passport.authenticate middleware invokes the verify function.
app.post('/login', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/login',
  //session: false
}));

// If the "login" is successful, the done method will call the serializeUser callback.
// This saves the user data in a session. The user will also be redirected to the /success route.
passport.use(new LocalStrategy(function(username, password, done) {
  if ((username === "John") && (password === "password")) {
    return done(null, {
      username: username,
      id: 1
    });
  } else {
    return done(null, false);
  }
}));

app.listen(8000, function() {
  console.log("Ready for some authentication action");
})
