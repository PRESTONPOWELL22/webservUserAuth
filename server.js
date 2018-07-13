var express = require('express')
var app = express()
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var bodyParser = require('body-parser')
var session = require('express-session')
var User = require('./models/user')
var path = require('path')
var mongoose = require('mongoose')

app.use(express.static('public'))
app.use(session({ secret: 'cats' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost/webservSMS')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', function (callback) {
  console.log('Connection succeeded.')
})

// strategy
passport.use(new LocalStrategy(
  function (username, password, done) { // needs a DB
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err) }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' })
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' })
      }
      return done(null, user)
    })
  }
))

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) { // needs mongo user model only user ID is serialized to keep stress off the browser
    done(err, user)
  })
})


app.post('/login', (req, res) => {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  })
  console.log(user)
  User.create(user)
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/login.html'))
})

app.listen(3000)
