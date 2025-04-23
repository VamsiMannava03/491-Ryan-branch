const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, required: true, unique: true },
  // Flag to indicate if the user's email has been verified
  isVerified: {
    type: Boolean,
    default: false
  },
  // A token used to verify the user's email
  verificationToken: String
});

// This plugin adds username, hash and salt field for password storage
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
