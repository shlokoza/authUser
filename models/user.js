const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//userschema set up
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        //setting username to be required field with an error message
        required: [true, 'User cannot be blank']
    },
    password: {
        type: String,
        //setting password to be required field with an error message
        required: [true, 'Password cannot be blank!']
    }
})

//defining a function on userSchema that validates the credentials of the user
userSchema.statics.findAndValidate = async function(username, password) {
    //find the user by username first
    const foundUser = await this.findOne({username});
    //then compare the password with the stored hashed password and return the boolean value
    const isValid = await bcrypt.compare(password, foundUser.password)
    //if isValid is true then return that user otherwise return false
    return isValid ? foundUser : false;
}

//defining the middleware that hashes the password before saving the user
userSchema.pre('save',async function(next) {
    /* checking if user has updated the the password. 
    if not, then letting the user save the updated info without hashing the password again. 
    if yes, then hashing the password. */
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
})


//exporting the User model
module.exports = mongoose.model('User', userSchema)