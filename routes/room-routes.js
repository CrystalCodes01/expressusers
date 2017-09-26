const express = require('express');
const router = express.Router();
const RoomModel = require('../models/room-model.js');

router.get('/rooms/new', (req, res, next) => {
  if (req.user) {
    res.render('room-views/new-room-view.ejs');
  }
  else {
    res.redirect('/login');
  }
});

router.post('/rooms', (req, res, next) => {
  const theRoom = new RoomModel ({
    name: req.body.roomName,
    description: req.body.roomDescription,
    photoUrl: req.body.roomPhotoUrl,
    hasGhosts: false,

    // Set the owner as the logged in users database Id
    owner: req.user._id
  });
  const coinFlip = Math.floor(Math.random() * 2);
    if (coinFlip === 1) {
      theRoom.hasGhosts = true;
    }
    theRoom.save((err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/my-rooms');
  });
});

router.get('/my-rooms', (req, res, next) => {
  if (req.user === undefined) {
    res.redirect('/login');
    return;
  }
  RoomModel.find(
      // find the rooms owned by the logged in user
    { owner: req.user._id },

    (err, roomResults) => {
      if (err){
        next(err);
        return;
      }
      res.locals.roomsAndStuff = roomResults;

      res.render('room-views/room-list-view.ejs');
    }
  );
});

module.exports = router;
