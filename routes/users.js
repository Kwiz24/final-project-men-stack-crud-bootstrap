const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('users/login'));

// Register Page
router.get('/register', (req, res) => res.render('users/register'));

// Register Handle
router.post('/register', async (req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];

  if (!username || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6 || password.length > 12) {
    errors.push({ msg: 'Password must be between 6 and 12 characters' });
  }

  if (errors.length > 0) {
    res.render('users/register', { errors, username, password, password2 });
  } else {
    try {
      const user = await User.findOne({ username });
      if (user) {
        errors.push({ msg: 'Username is already registered' });
        res.render('users/register', { errors, username, password, password2 });
      } else {
        const newUser = new User({ username, password });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/users/login');
      }
    } catch (err) {
      console.error(err);
      res.render('users/register', { errors: [{ msg: 'Something went wrong' }], username, password, password2 });
    }
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
