const express = require('express');
const router = express.Router();
const userModel = require('./users')
const postModel = require('./post')
const passport = require('passport');
const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav : false,error : req.flash('error')}); 
});
  
router.post('/fileupload',isloggedin,upload.single('pimage'),async function(req, res, next) {
  const user = await  userModel.findOne({username : req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');       
})


router.get("/edit", isloggedin, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { nav: true, user });
});
router.post("/update", isloggedin, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name },
    { new: true }
  );
  req.login(user, function (err) {
    if (err) throw err;
    res.redirect("/profile");
  });
});

router.get('/profile', isloggedin,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  .populate('posts')
  res.render('profile',{user, nav : true} );
})
router.get('/show/posts', isloggedin,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  .populate('posts')
  res.render('show',{user, nav : true} ); 
})

router.get('/show/posts/:cardid', isloggedin, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
    const cardid = req.params.cardid;
    res.render('singleUser', { cardid: cardid, user: user, nav: true });
  } catch (error) {
    next(error);
  }
});



router.get('/feed', isloggedin,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  const allpost = await postModel.find()
  .populate('user')
  res.render('feed',{user,allpost, nav : true} );
});

router.get('/add', isloggedin,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('add',{user, nav : true} );
})
router.post('/postscreate',isloggedin,upload.single('postimage'),async (req, res, next) => {
  const user = await userModel.findOne({username : req.session.passport.user})
  const post = await postModel.create({
    title : req.body.title,
    description : req.body.description,
    image : req.file.filename,
    user : user._id,
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile/');
})
router.post('/register',async (req, res, next) => {
  const userfata= new userModel({
    username : req.body.username,
    email : req.body.email,
    name : req.body.name,
    contact : req.body.contact
  })
  userModel.register(userfata , req.body.password)
  .then(() => {
    passport.authenticate('local')(req.res , () => {
      res.redirect('/profile')
    })
  })
})
router.post('/createpost',isloggedin,upload.single('postimage'),async (req, res, next) => {
  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await  postModel.create({
    user : user._id,
    title : req.body.title,
    description : req.body.description,
    image : req.file.filename,
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});



router.get('/register', function(req, res, next) {
  res.render('register',{nav : false});
});

router.post('/register', function(req, res, next) {
  const userdata = new userModel({
    username : req.body.username,
    email : req.body.email,
    name : req.body.name,
    contact : req.body.contact
  })
  userModel.register(userdata,req.body.password)
  .then(() => {
    passport.authenticate('local')(req,res,() =>{
      res.redirect('/profile')
    })
  })
});
router.post('/login', passport.authenticate('local',{
  successRedirect : '/profile',
  failureRedirect : '/',
  failureFlash : true ,
}),(req,res) =>{})

router.get('/logout',(req,res,next) =>{
   req.logout((err) =>{
    if(err){return next(err)}
    res.redirect('/')
   });
});

function isloggedin(req, res, next) {
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
};

module.exports = router;
