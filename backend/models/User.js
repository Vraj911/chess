const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username must be less than 20 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profilePicture: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 1200,
    min: 100,
    max: 3000
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  gamesDrawn: {
    type: Number,
    default: 0
  },
  gamesLost: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};
userSchema.virtual('winRate').get(function() {
  if (this.gamesPlayed === 0) return 0;
  return Math.round((this.gamesWon / this.gamesPlayed) * 100);
});
userSchema.virtual('totalScore').get(function() {
  return (this.gamesWon * 3) + this.gamesDrawn;
});
module.exports = mongoose.model('User', userSchema);
