const express = require("express");
const router = express.Router();
const Profile= require('../../model/Profile');
const passport= require('passport');
const User = require("../../model/User");
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require("../../validation/profile");


router.get("/test", (req, res) => {
  res.json({
    Msg: "Profile Works",
  });
});

router.get('/', passport.authenticate('jwt', {session: false}), (req, res)=>{

  const errors= {};

  Profile.findOne({user: req.user.id})
    .populate('users', ['name', 'avatar'])
    .then(profile =>{
      if(!profile){
        errors.noProfile= "There is no profile for this user";
        return res.status(404).json(errors);
      }

      return res.json(profile);
    })
      .catch(err=>res.status(404).json({Profile: "No Profile found"}));
    

});

router.get('/all', (req,res)=>{

  const errors={};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles =>{
      if(!profiles){
        errors.noProfile= "There are no more profiles";
        return res.status(404).json(errors);
      }

      return res.json(profiles);
    })
     .catch(err =>res.status(404).json(err));
});

router.get('/handle/:handle', (req,res)=>{
  const errors= {};

  Profile.findOne({handle: req.params.handle})
    .populate('user', ['name', 'avatar'])
    .then(profile =>{
      if(!profile){
        errors.noProfile= "No profile found";
        return res.status(404).json(errors);
      }

      return res.json(profile);
    })
     .catch(err => res.status(404).json(err));
});

router.get('/user/:user_id', (req,res)=>{
  const errors= {};

  Profile.findOne({user: req.params.user_id})
    .populate('users', ['name','avatar'])
    .then(profile =>{
      if(!profile){
        errors.noProfile= "No profile found";
        return res.status(404).json(errors);
      }

      return res.json(profile);
    })
     .catch(err => res.status(404).json({error: "No profile for this user_id"}));
});

router.post('/', passport.authenticate('jwt', {session:false}), (req,res)=>{

  const {errors, isValid} = validateProfileInput(req.body);

  if(!isValid){
    return res.status(404).json(errors);
  }

  const profileFields= {};

  profileFields.user= req.user.id;

  if(req.body.handle) profileFields.handle= req.body.handle;
  if(req.body.status) profileFields.status= req.body.status;

  if(req.body.website) profileFields.website= req.body.website;

  if(req.body.company) profileFields.company= req.body.company;

  if(req.body.location) profileFields.location= req.body.location;

  if(req.body.bio) profileFields.bio= req.body.bio;

  if(req.body.githubusername) profileFields.githubusername= req.body.githubusername;

  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills= req.body.skills.split(',');
  }


  profileFields.social= {};

  if(req.body.youtube) profileFields.social.youtube= req.body.youtube;
  if(req.body.facebook) profileFields.social.facebook= req.body.facebook;

  if(req.body.twitter) profileFields.social.twitter= req.body.twitter;

  if(req.body.instagram) profileFields.social.instagram= req.body.instagram;

  if(req.body.linkedin) profileFields.social.linkedin= req.body.linkedin;

  Profile.findOne({user: req.user.id})
    .then(profile=>{
      if(profile){
        Profile.findOneAndUpdate({user: req.user.id},{$set: profileFields}, {new: true})
          .then(res.json(profile))
      }else{
        Profile.findOne({handle: profileFields.handle})
          .then(profile=>{
            if(profile){
              errors.handle= "Handle already exists";
              res.status(400).json(errors);
            }
            new Profile(profileFields).save().then(profile=>res.json(profile));
          })
      }

    })



})


router.post('/experience', passport.authenticate('jwt', {session: false}), (req,res)=>{

  const {errors,isValid} = validateExperienceInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  Profile.findOne({user: req.user.id}).then(profile=>{
    if(!profile){
      errors.noProfile= "No profile found";
      return res.status(404).json(errors);
    }

    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,

    };

    profile.experience.unshift(newExp);
    profile.save().then(profile => res.json(profile));




  })
   .catch(err => res.json(err));

});


router.post('/education', passport.authenticate('jwt', {session: false}), (req,res)=>{

  const {errors,isValid} = validateEducationInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  Profile.findOne({user: req.user.id}).then(profile=>{
    if(!profile){
      errors.noProfile= "No profile found";
      return res.status(404).json(errors);
    }

    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,

    };

    profile.education.unshift(newEdu);
    profile.save().then(profile => res.json(profile));




  })
   .catch(err => res.json(err));

});

router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req,res) =>{

  let errors={};

  Profile.findOne({user: req.user.id})
    .then(profile =>{


      if(!profile){
        errors.noProfile= "No Profile found";
        return res.status(400).json(errors);
      }

      const removeIndex= profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex,1);

      profile.save().then(profile => res.json(profile));

    })
    .catch(err => res.status(404).json(err));
});


router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req,res) =>{

  let errors={};

  Profile.findOne({user: req.user.id})
    .then(profile =>{


      if(!profile){
        errors.noProfile= "No Profile found";
        return res.status(400).json(errors);
      }

      const removeIndex= profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

      profile.education.splice(removeIndex,1);

      profile.save().then(profile => res.json(profile));

    })
    .catch(err => res.status(404).json(err));
});

router.delete('/', passport.authenticate('jwt', {session:false}), (req,res) =>{
  Profile.findOneAndRemove({user: req.user.id})
    .then(()=>{
      User.findOneAndRemove({_id: req.user.id})
        .then(()=>{
          res.json({success: true});
        });
    });
});





module.exports= router;
