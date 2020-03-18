const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/connectionurl')


//@type - GET
//@desc - A test auth api
//@route - api/auth
//@access -PUBLIC
router.get('/' , (req , res)=>res.json({test:"Auth is being tested"}));


//Import schema to register Person
const Person = require('../../models/Person');

//@type - POST
//@desc -route for registration for users
//@route - api/auth/register
//@access -PUBLIC
router.post('/register' , (req , res)=>{
    Person.findOne({email : req.body.email})
    .then(pers => {
        if(pers){
            return res.status(400).json({emailError : 'Email is already registered...'})
        }else{
            const newPerson = new Person({
                name : req.body.name , 
                email : req.body.email,
                password : req.body.password           
            });

            // Encrypt password in bcrypt;
            bcrypt.genSalt(10,(err, salt) => {
                bcrypt.hash(newPerson.password, salt, (err, hash) => {
                    // Store hash in your password DB.
                    if(err){
                        console.log(err);
                    }

                    newPerson.password = hash ;
                    newPerson.save()
                    .then(pers => res.json(pers))
                    .catch(err=> console.log(err));
                });
            });


        }

    })
    .catch((error)=>console.log(error));
});


//@type - POST
//@desc -route for login of users
//@route - api/auth/login
//@access -PUBLIC

router.post('/login' , (req , res)=>{
    const email = req.body.email ; 
    const password = req.body.password ;
    Person.findOne({email}).
    then(pers =>{
        if(!pers){
            return res.status(404).json({emailError: 'User not found with this email'});
        }
        bcrypt.compare(password , pers.password)
        .then(isVerified=>{
            if(isVerified){
                //res.json({success:'User is able to login successfully'});

                //use payload and create token for user
                const payload = { 
                    id :pers.id,
                    name : pers.name,
                    email : pers.email
                };

                jsonwt.sign(payload , key.secret , {expiresIn : 3600} , 
                    (err , token)=>{
                        res.json({
                            success:true , 
                            token:token
                        });
                    })


            }else{
                res.status(400).json({passwordError:'Incorrect Password'})
            }

        })
        .catch(error=>console.log(error));


    })
    .catch(error => console.log(error))
})

//@type - POST
//@desc -route for profile of users
//@route - api/auth/profile
//@access -PRIVATE

router.get('/profile' , passport.authenticate('jwt' , {session:false} ), (req,res)=>{
    //console.log(req);
    res.json({
        name:req.user.name , 
        email:req.user.email , 
        profilepic: req.user.profilepic
    })
});



module.exports = router;