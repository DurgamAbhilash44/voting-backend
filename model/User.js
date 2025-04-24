const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  mobile: {
    type: String
  },
  aadharCardNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{12}$/, 'Aadhar must be 12 digits']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'voter'],
    default: 'voter'
  },
  isVoted: {
    type: Boolean,
    default: false
  }
});

UserSchema.pre('save', async function(next) {
  const person = this;

  if (!person.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    person.password = await bcrypt.hash(person.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
