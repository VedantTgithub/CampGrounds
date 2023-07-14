const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const Campground = require('./models/campground');
const axios=require('axios');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const Review=require('./models/review');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const localstrategy=require('passport-local');
const passportlocalMongoose=require('passport-local-mongoose');
const User=require('./models/user');
const {isLoggedIn}=require('./middleware');
const e = require('connect-flash');

// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(flash());

const sessionconfig={
    secret:'thisshouldbeasecret!',
    resave:false,
    saveUnitialized:true,
    cookie:{
        httpOnly:true,
    expires:Date.now()+1000*60*60*24*7,
    maxage:1000*60*24*24*7
    }
}
app.use(session(sessionconfig))
app.use((req,res,next)=>{
    res.locals.currentuser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/fakeuser',async(req,res)=>{
const user=new User({email:'vedant0711@gmail.com',username:'vedant0711'})
const newUser= await User.register(user,'chicken');
res.send(newUser);
})


app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.get('/makecampground',async(req,res)=>{
    const camp=new Campground({
        title:"Nalla"
    })
    await camp.save();
    res.send(camp);
})

app.get('/register',async(req,res)=>{
    res.render('users/register');
})
app.post('/register',async(req,res)=>{
    const {username,password,email}=req.body;
    const user=new User({username,email});
    const registeredUser=await User.register(user,password);
    console.log(registeredUser);
    res.redirect('/campgrounds');
})

app.get('/campgrounds',async(req,res)=>{
    const campgrounds= await Campground.find();
    res.render('campgrounds/index',{campgrounds})
})
app.get('/campgrounds/new',(req,res)=>{
    console.log('REQ.USER...',req.user);
    if(!req.isAuthenticated())
    {
        req.flash('error','you nust be signed in!');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');
})
app.post('/campgrounds',async(req,res)=>{
    
    // const geodata= await geocoder.forwardGeocode({
    //     query:req.body.campground.location,
    //     limit:1,
    // }).send()
    // res.send(geodata.body.features[0].geometry.coordinates);
    
    
    const campground=new Campground(req.body.campground);  //req.body.campground is done because name in form is aved under campground 
    //campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success','Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
    
})


app.get('/campgrounds/:id',async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews').populate('author');
console.log(campground);
    res.render('campgrounds/show',{campground});
})

app.get('/campgrounds/:id/edit',async(req,res)=>{
    if(!req.isAuthenticated())
    {
        req.flash('error','you nust be signed in!');
        return res.redirect('/login');
    }
    const campground=await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
})
app.put('/campgrounds/:id',async(req,res)=>{
    if(!req.isAuthenticated())
    {
        req.flash('error','you nust be signed in!');
        return res.redirect('/login');
    } 
    
  const{id}=req.params;
  const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`);
    
})

app.delete('/campgrounds/:id',async(req,res)=>{
    
    const{id}=req.params;
    const campground=await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.delete('/campgrounds/:id/reviews/:reviewId',async(req,res)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
})


app.post('/campgrounds/:id/reviews',async(req,res)=>{
     const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

})

app.get('/login',async(req,res)=>{
    res.render('users/login');
})

app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','welcome back');
    res.redirect('/campgrounds');
})

app.get('/logout',(req,res)=>{
req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success','Goodbye');
    res.redirect('/campgrounds');
  });

})



app.listen(3000,()=>{
    console.log("running");
})
