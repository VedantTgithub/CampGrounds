const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.flash('error','you nust be signed in!');
        return res.redirect('/login');
    }
    next();
}