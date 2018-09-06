const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load Profile Model
const Profile = require("../../models/Profile");
//Load User Model
const User = require("../../models/User");

//@route GET api/profile/test
//@desc
//@acccess is public
router.get("/test", (req, res) => res.json({ msg: "User works" }));

//@route GET api/profile
//@desc Get current User's profile
//@acccess is Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"]) //to add the user info to the profile
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route POST api/profile
//@desc Create or Edit User's profile
//@acccess is Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Get all the fields in the profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;

    //Skills is coming in as array of comma separated values
    if (typeof req.body.skillset !== "undefined") {
      profileFields.skillset = req.body.skillset.split(",");
    }
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.github_username)
      profileFields.github_username = req.body.github_username;

    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update Profile if it already exist
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //Check if  handle exist
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          //Save profile if handle doesn't exist
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

//@route GET api/profile/all
//@desc Get all profiles
//@acccess is Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"]) //to add the user info when displaying the profile
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profiles: "There are no profiles" }));
});

//@route GET api/profile/handle/:handle
//@desc Get orofile by handle
//@acccess is Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"]) //to add the user info when displaying the profile
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route GET api/profile/user/:user_id
//@desc Get profile by user_id
//@acccess is Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"]) //to add the user info when displaying the profile
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//@route POST api/profile/experience
//@desc Add experience to profile
//@acccess is Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExperience = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //Add it to the experience array
      profile.experience.unshift(newExperience);
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route POST api/profile/education
//@desc Add education to profile
//@acccess is Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        field_of_study: req.body.field_of_study,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //Add it to the experience array
      profile.education.unshift(newEducation);
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@acccess is Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Get index of experience and remove it
      const removeExpIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //Splice it out of the array
      profile.experience.splice(removeExpIndex, 1);

      //Save and display our updated profile
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route DELETE api/profile/education/:edu_id
//@desc Delete education from profile
//@acccess is Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get the idex of the education and remove it
        const removeEduIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        //splice it out of the array
        profile.education.splice(removeEduIndex, 1);

        //Save and display our updated profile
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route DELETE api/profile/education/:edu_id
//@desc Delete User and Profile
//@acccess is Private
router.delete(
  "/:user_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findByIdAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      })
      .catch(err => res.status(404).json(err));
  }
);
module.exports = router;
