const express = require('express');
const UserModel = require('../models/user-model.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport     = require('passport');

////////  BEGIN registration /////////////

router.get('/signup', (req,res, next) => {
  if (req.user) {
    res.redirect('/');
  }
  else {
    res.render('auth-views/signup-view.ejs');
  }
});
// --------NEW NOTES AND STUFF, COMPARE TO WHAT YOU HAVE VVVVVVVV----------
router.post('/signup', (req,res, next)=> {
  // If username or password are empty
  if (req.body.signupUsername === '' || req.body.signupPassword === ''){
    // If either of them it true, display an error to the user
    res.locals.messageForDumbUsers = 'Please provide both username and password!';

    res.render('auth-views/signup-view.ejs');
    return;
  }
  // Otherwise, check to see if the submitted username is taken
  UserModel.findOne(
    { username: req.body.signupUsername },
    (err, userFromDb) => {
      // Just in case there is some random DB query error VVVVV
      if(err){
        next(err);
        return;
      }
      // ^^^^^^^^^-------------------^^

      // If the username is taken, the "userFromDb" variable will have a result

      // Check if 'userFromDb' is not empty
      if (userFromDb) {
        // If that's the case (userFromDb is not empty), display an error to the user
        res.locals.messageForDumbUsers = 'Sorry, that username is taken.';

        res.render('auth-views/signup-view.ejs');
        return;
      }
      // If we get here, we are ready to save the new user in the DB.
      const salt = bcrypt.genSaltSync(10); // use salt to encrypt
      const scrambledPassword = bcrypt.hashSync(req.body.signupPassword, salt);

        const theUser = new UserModel({
          fullName: req.body.signupFullName,
          username: req.body.signupUsername,
          encryptedPassword: scrambledPassword
        });

        theUser.save((err) => {
          if (err){
            next(err);
            return;
          }
          // redirect to home if registration is SUCCESSFUL
          res.redirect('/');
        });
    }
  );
//---------NEW NOTES AND STUFF, COMPARE TO WHAT YOU HAVE ^^^^^^^^^^----------

});

/////// END registration ///////////

// LOG IN //

router.get('/login', (req, res, next) => {
  if (req.user) {
    res.redirect('/');
  }
  // if not logged in redirect to login
  else {
    res.render('auth-views/login-view.ejs');
  }
});

router.post('/login', passport.authenticate (
    'local',            // 1st argument -> name of the srategy (determined bynpm pack)
    {                  // 2nd argument -> settings object determined by passport
      successRedirect: '/',
      failureRedirect: '/login'
    }
));

// END LOG IN //

router.get ('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

// Social Logins //
//// BEGIN FACEBOOK ////
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect:'/special',
      failureRedirect:'/login'
    }
  )
);

//// END FACEBOOK ////

//// BEGIN GOOGLE ////
router.get('/auth/google',
  passport.authenticate(
    'google',
    {
      scope: ["https://www.googleapis.com/auth/plus.login",
              "https://www.googleapis.com/auth/plus.profile.emails.read"]
    }
  ));

router.get('/auth/google/callback',
  passport.authenticate(
    'google',
    {
      successRedirect:'/special',
      failureRedirect:'/login'
    }
  )
);
//// END GOOGLE ////
// END Social Logins //




module.exports = router;
