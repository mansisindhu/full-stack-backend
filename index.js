const express = require("express");
const connect = require("./config/db");
const userRouter = require("./routes/user.route");
const blogRouter = require("./routes/blog.route");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors({
    origin: process.env.FRONTEND_URL
}))
app.use(express.json()); // Body parsing

app.use("/users", userRouter);
app.use("/blogs", blogRouter)

app.get("/health", (req, res) => {
    res.send("OK!")
})

const PORT = process.env.PORT

app.listen(PORT, async () => {
    await connect();
    console.log("Listening to server on " + PORT)
})