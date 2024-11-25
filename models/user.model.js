const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["reader", "admin", "author"],
        default: "reader"
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;