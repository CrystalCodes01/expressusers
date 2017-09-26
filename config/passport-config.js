// We are configuring Passport in a separate file to avoid making a mess in app.js

const passport= require('passport');
const bcrypt = require('bcrypt');

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const UserModel = require('../models/user-model.js');


// serializeUser  (controls what goes into the bowl)
// save only the users database ID in the bowl
// happens only when you log in

// deserializeUser (controls  what you get when you check the bowl)
// uses the id in the bowl to retrive the users information
// happens everytime you visit the site after logging in

passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id); // null in 1st argument means no error
});

passport.deserializeUser((idFromBowl, next) => {  // user is already logged in
  UserModel.findById (
    idFromBowl,

    (err, userFromDb) => {
      if (err) {
        next(err);
        return;
      }
      // Tell passport that we got the users info from the DB
      next(null, userFromDb);
    }
  );
});


// STRATEGIES  VVVVVVVVVV------------------------------------
//   the different ways we can log into our app
// example logging in with google, facebook, twitter etc.

// SET UP passport-local (log in with username and password from a form)
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy (   // tells passport that there is a strategy that exists
  {                        // 1st argument -> settings object
    usernameField: 'loginUsername',
    passwordField: 'loginPassword'
  },
  ( formUsername, formPassword, next ) => {        // 2nd argument -> callback (called when a user tries to log in)
      // the logic and operations within the callback are what happen when the user tries to log in.


    // #1 Is there an account with the provided username?
    //  (is there a user with that username in the database?)
    UserModel.findOne (
      { username: formUsername }, //formUsername - query the username

      (err, userFromDb) => { // random errors
        if (err){
          next(err);
          return;
        }

        // If the username doesnt exist, the "userFromDb" variable will be empty

        if (userFromDb === null) { // Check if "userFromDb" is empty
          // In Passport, if you call next with "false" in the 2nd position, that means LOGIN FAILED
          next(null, false);
          return;
        }
        // #2 If there is a user with that username, is the PASSWORD correct?
        if (bcrypt.compareSync(formPassword , userFromDb.encryptedPassword) === false) {
          // In Passport, if you call next() with "false" in 2nd position, that means LOGIN FAILED
          next(null, false);
          return;
        }

        // if we pass those "if" statements, LOGIN SUCCESS!
        next(null, userFromDb);
        // In Passport, if you call next() with a user in 2nd position, that means LOGIN SUCCESS
        // add to database
      }
    );

  }
));

// passport facebook (login with your facebook account)

const FbStrategy = require('passport-facebook').Strategy;

passport.use(new FbStrategy(
  {                         // 1st argument -> callback
    clientID: '120449941895443',
    clientSecret: 'b0a82885bd4cb3d8cc9822b6c143d411',
    callbackURL: '/auth/facebook/callback'
  },

  (accessToken, refreshToken, profile, next) => {  // 2nd argument -> callback
                    // (will be called when a user allows us to log them in with facebook)
        console.log('');
        console.log('------------  👽 FACEBOOK PROFILE INFO 👽 --------------');
        console.log(profile);
        console.log('');

        UserModel.findOne(
          { facebookId: profile.id },

          (err, userFromDb) => {
            if (err) {
              next(err);
              return;
            }
             // if this is the first time the user logs in from facebook 'userFromDb' will be empty

             // check if they have logged in before
             if (userFromDb) {
               next(null, userFromDb);
               return;
             }

             // if its the first log in save them in the DB
             const theUser = new UserModel({
               fullName: profile.displayName,
               facebookId: profile.id
             });

             theUser.save((err) => {
               if (err) {
                 next(err);
                 return;
               }
               // Now they are saved - log them in
               next(null, theUser);
             });
          }
        );
      // receiving the facebook user info and saving it
    // UNLESS we have already saved their info, in which case we log them in
  }
));

passport.use(new GoogleStrategy(
  {                         // 1st argument -> callback
    clientID: '964805687503-cgvo9cn94f0hrrlk15i4hip7350m1kec.apps.googleusercontent.com',
    clientSecret: 'IaGO_0vi-AlQculUqHtnZ5P6',
    callbackURL: '/auth/google/callback'
  },

  (accessToken, refreshToken, profile, next) => {  // 2nd argument -> callback
                    // (will be called when a user allows us to log them in with facebook)
        console.log('');
        console.log('------------  🌪 GOOGLE PROFILE INFO 🌪  --------------');
        console.log(profile);
        console.log('');

        UserModel.findOne(
          { googleId: profile.id },

          (err, userFromDb) => {
            if (err) {
              next(err);
              return;
            }
             // if this is the first time the user logs in from facebook 'userFromDb' will be empty

             // check if they have logged in before
             if (userFromDb) {
               next(null, userFromDb);
               return;
             }

             // if its the first log in save them in the DB
             const theUser = new UserModel({
               fullName: profile.displayName,
               googleId: profile.id
             });

            // if the displayName is empty use email instead
             if (theUser.fullName === undefined) {
               theUser.fullName = profile.emails[0].value;
             }

             theUser.save((err) => {
               if (err) {
                 next(err);
                 return;
               }
               // Now they are saved - log them in
               next(null, theUser);
             });
          }
        );
      // receiving the facebook user info and saving it
    // UNLESS we have already saved their info, in which case we log them in
  }
));
