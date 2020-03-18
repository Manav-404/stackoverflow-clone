const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Person = require('../../models/Person');
const Profile = require('../../models/Profile');

//@type - GET
//@desc -route for User profile
//@route - api/profile
//@access -PRIVATE
router.get('/' , passport.authenticate('jwt' , {session:false}) , (req ,res)=>{
    Profile.findOne({user : req.user.id})
    .then(prof=>{
        if(!prof){
            res.status(404).json({profileNotFound : 'Couldnt find any profile'})
        }
        res.json(prof);
    })
    .catch(err=>console.log(err));

});


//@type - POST
//@desc -route for UPDATING/SAVING User profile
//@route - api/profile
//@access -PRIVATE
router.post('/' , passport.authenticate('jwt' , {session:false}) , (req ,res)=>{
    const profileValues={};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username= req.body.username ; 
    if (req.body.website) profileValues.website= req.body.website ; 
    if (req.body.country) profileValues.country= req.body.country ; 
    if (req.body.portfolio) profileValues.portfolio= req.body.portfolio ; 
    if (typeof req.body.languages!== undefined) {
        profileValues.languages= req.body.languages.split(',')
    } 
    profileValues.social = {};
    if (req.body.facebook) profileValues.social.facebook= req.body.facebook ; 
    if (req.body.instagram) profileValues.social.instagram= req.body.instagram ;
    
    Profile.findOne({user:req.user.id})
    .then(prof_=>{
        if(prof_){
            Profile.findOneAndUpdate(
                {user:req.user.id} , 
               {$set : profileValues} ,
               {new:true} 
            ).then(prof=>res.json(prof))
            .catch(err=>console.log("Problem in update : "+err))
        }else{
            Profile.findOne({username:profileValues.username})
            .then(prof=>{
                if(prof){
                    res.status(400).json({username:'username already exists'})
                }

                new Profile(profileValues).save()
                .then(prof=>res.json(prof))
                .catch(err=>console.log("could not save to the database : "  +err));
            })
            .catch(err=>console.log("cant find by username : "+err))
        }
    })
    .catch(err=>console.log("Problem in finding user : "+err));

    
})



//@type - GET
//@desc -route for getting user profile
//@route - api/profile/:username
//@access -PUBLIC

router.get('/:username', (req ,res)=>{
    Profile.findOne({username : req.params.username})
    .populate('user' , ['name'  , 'profilepic'])
    .then(profile=>{
        if(!profile){
            res.status(404).json({userNotFound : 'User Not Found'})
        }
        res.json(profile);
    })
    .catch(err => console.log('Error in fetching username'+err))
})

//@type - GET
//@desc -route for getting all profile
//@route - api/profile/find/all
//@access -PUBLIC

router.get('/find/all', (req, res) => {
    Profile.find()
        .populate('user', ['name', 'profilepic'])
        .then(profiles => {
            if (!profiles) {
                res.status(404).json({ userNotFound: 'User Not Found' })
            }
            res.json(profiles);
        })
        .catch(err => console.log('Error in fetching username' + err))
})



//@type - DELETE
//@desc -route for gdeleting user 
//@route - api/profile/
//@access -PRIVATE


router.delete('/' , passport.authenticate('jwt' , {session:false} ) , (req ,res)=>{
    Profile.findOne({user :req.user.id});
    Profile.findOneAndRemove({ user: req.user.id })
    .then(()=>{
        Person.findOneAndRemove({_id:req.user.id})
        .then(()=>res.json({success:'Delete was succesful'}))
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))
})



//@type - POST
//@desc -route for adding work profile of a person 
//@route - api/profile/work
//@access -PRIVATE

router.post('/workrole' , passport.authenticate('jwt' , {session:false}) , (req ,res)=>{
    Profile.findOne({user : req.user.id})
    .then(profile=>{
        const newWork ={
            role : req.body.role ,
            company : req.body.company , 
            country : req.body.country , 
            from : req.body.from , 
            to : req.body.to , 
            current : req.body.current , 
            details : req.body.details
        };
        profile.workrole.unshift(newWork);
        profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log)
    })
    .catch(err => console.log(error))
})


//@type - DELETE
//@desc -route for deleting work profile of a person 
//@route - api/profile/work/:id
//@access -PRIVATE

router.delete('/workrole/:w_id' , passport.authenticate('jwt' , {session:false}) , (req,res)=>{
    Profile.findOne({user : req.user.id})
    .then(profile => {
        const removeElement = profile.workrole.map(item => item.id).indexOf(req.params.w_id);
        profile.workrole.splice(removeElement , 1)
        profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err))


    })
    .catch(err=> console.log(err))
})


module.exports = router;