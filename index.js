const express = require('express');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const User = require('./models/user');
const session = require('express-session')

//setting up the mongoose connection
mongoose.connect('mongodb://localhost:27017/bcryptDemo', {    
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() =>{
        console.log('Mongo Connection Open!')
    })
    .catch(err => {
        console.log('Error!')
        console.log(err)
    })

//setting up the view engine
app.set('view engine' , 'ejs');
app.set('views', 'views');

//usig urlencoded to parse the body
app.use(express.urlencoded({extended: true}))
//setting up session
const sessionSettings = {
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: false
}
app.use(session(sessionSettings))

//making a middleware to handle the authentication
const requireLogin = (req, res, next) => {
    //if the session does not have user_id then redirect them to login page
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}

//route for the home page
app.get('/', (req,res) => {
    res.send('You have reached to home page!');
})

//route to render the register form page
app.get('/register', (req,res) => {
    res.render('register')
})


app.post('/register', async(req,res) => {
    //getting and destructuring user inputs from body
    const {password, username} = req.body;
    //making new user instance of User schema
    const user = new User({ username, password })
    //saving user to the database
    await user.save();
    //storing the newly registered user's id to session
    req.session.user_id = user._id;
    //redirecting to the home route
    res.redirect('/login')
})

//route to render the login form page
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/logout', (req, res) => {
    /* to logout, set the session user id to null.
    this will automatically logout user. 
    if stored multiple information in session cookies, use this line of code to logout and remove saved information
    req.session.destroy() */
    req.session.user_id = null;
    res.redirect('/login')
})

app.post('/login', async(req, res) => {
    //getting and destructuring user inputs from body
    const {username, password} = req.body;
    //calling findAndValidate function on userSchema passing username and password
    const foundUser = await User.findAndValidate(username, password)
    if(foundUser){
        //storing the user logged in user's id to session
        req.session.user_id = foundUser._id;
        res.redirect('/secret')
    }else{
        res.redirect('/login')
    }
})

//Creating a route which can be seen only if user is logged in
app.get('/secret' , requireLogin, (req,res) => {
    res.render('secret')
})

//Listening on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}...`)
})