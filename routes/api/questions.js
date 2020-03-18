const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


const Person = require('../../models/Person');
const Profile = require('../../models/Profile');

const Question = require('../../models/Question');



//@type - GET
//@desc -route for showing all questions
//@route - api/questions
//@access -PRIVATE

router.get('/', (req, res) => {
    Question.find()
    .then(questions=>res.json(questions))
    .catch(err => res.json({noQuestions : 'No questions to display'}))
});

//@type - POST
//@desc -route for submitting questions
//@route - api/questions/
//@access -PRIVATE

router.post('/' , passport.authenticate('jwt' , {session:false}) , (req , res)=>{
    const newQuestion = new Question({
        textone : req.body.textone , 
        texttwo : req.body.texttwo , 
        user : req.user.id , 
        name:req.body.name
    });

    newQuestion.save()
    .then(question =>res.json(question))
    .catch(err => console.log(err))
})


//@type - POST
//@desc -route for submitting answer to questions
//@route - api/comment/:c_id
//@access -PRIVATE

router.post('/comment/:c_id' , passport.authenticate('jwt' , {session:false}) , (req ,res)=>{
    Question.findById(req.params.c_id)
    .then(question=>{
        const newComment = {
            user : req.user.id , 
            name : req.body.name , 
            answertext:req.body.answertext
        };

        question.answers.unshift(newComment);
        question.save()
        .then(question => res.json(question))
        .catch(err => console.log(err))

    })
    .catch(err=>console.log(err))
})

//@type - POST
//@desc -route for upvoting to questions
//@route - api/questions/upvote/:id
//@access -PRIVATE

router.post('/upvote/:id' , passport.authenticate('jwt' , {session:true}) , (req , res)=>{
    Profile.findOne(req.user.id)
    .then(profile=>{
        Question.findById(req.params.id)
        .then(question => {
            if (question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length>0 ){
                return res.status(400).json({noupvote:"User Already Upvoted"})
            }
            question.upvotes.unshift(req.user.id);
            question.save()
            .then(question=>res.json(question))
            .catch(err => console.log(err))
        })
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))
})


module.exports = router;