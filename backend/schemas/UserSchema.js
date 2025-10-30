const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  // email will be stored under the 'username' field by default
  // passport-local-mongoose will add 'hash' and 'salt' fields
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Plugin to add username, hash and salt fields
// and helper methods
UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email", // Use email as the unique identifier
});

module.exports = { UserSchema };