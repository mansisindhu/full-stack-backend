const mongoose = require("mongoose");

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connect;