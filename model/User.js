
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

const UserSchema=new mongoose.Schema({

       name:{
        type:String,
        require:true
       },
       age:{
        type:Number,
        require:true
       },
       address:{
        type:String,
        require:true
       },
       email:{
        type:String
       },
       mobile:{
        type:String
       },
       aadharCardNumber:{
        type:Number,
        require:true,
        unique:true,
        length:16
       },
       password:{
        type:String,
        require:true
       },
       role:{
        type:String,
        enum:['admin','voter'],
        default:'voter'
       },
       isVoted:{
        type:Boolean,
        default:false
       }
})




UserSchema.pre('save', async function(next) {
    const person = this;
    
    // Only hash password if it's modified or new
    if (!person.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(person.password, salt);
        person.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});




UserSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const User=mongoose.model('User',UserSchema);

module.exports=User;