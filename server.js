var express = require('express')
var app = express()
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var bodyParser = require('body-parser')
var session = require('express-session')

app.use(express.static('public'))
app.use(session({ secret: 'cats' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

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

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true })
)
