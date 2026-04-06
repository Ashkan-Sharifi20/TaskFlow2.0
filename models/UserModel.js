const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

/**
 * Pre-save Middleware
 * Automatically hashes the password before it is saved to MongoDB.
 * Note: We do not use 'next' here because it is an async function.
 */
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Success - Mongoose will proceed to save automatically
  } catch (err) {
    // If hashing fails, the error is thrown and caught by your route's catch block
    throw err;
  }
});

module.exports = mongoose.model("User", userSchema);