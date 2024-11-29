const express = require("express");
const router = express.Router();
const Blog = require("../models/blog.model");
const auth = require("../middleware/auth");
const checkAccess = require("../middleware/checkAccess");
const ROLES = require("../constant/roles");

// 1. Get blogs - No need to auth
router.get("/", async (_, res) => {
    try {
        const blogs = await Blog.find().populate("author", "username");
        res.json(blogs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// 2. Create blog - Need auth / Author
router.post("/create", auth, checkAccess(ROLES.author), async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.userId;

        const blog = new Blog({ title, content, author: userId });
        const savedlog = await blog.save();

        res.status(201).json(savedlog)
    } catch (err) {
        res.status(400).json({ message: "Something went wrong!" })
    }
})

// 3. Edit blog -  Need auth / Author of this blog
router.patch("/update/:id", auth, checkAccess(ROLES.author), async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);

        // If the blog doesn't exist
        if (!blog) {
            return res.status(404).json({ message: "Blog not found!" })
        }

        // Check if this author is actual writer of this blog
        if (req.userId.toString() !== blog.author.toString()) {
            return res.status(403).json({ message: "Forbidden!" })
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, { new: true });
        res.json(updatedBlog)
    } catch (err) {
        res.status(400).json({ message: "Something went wrong!" })
    }
})

// 4. Delete blog - Need auth / Author of this blog
router.delete("/delete/:id", auth, checkAccess(ROLES.author), async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);

        // If the blog doesn't exist
        if (!blog) {
            return res.status(404).json({ message: "Blog not found!" })
        }

        // Check if this author is actual writer of this blog
        if (req.userId.toString() !== blog.author.toString()) {
            return res.status(403).json({ message: "Forbidden!" })
        }

        await Blog.findByIdAndDelete(blogId);
        res.json({ message: "Deleted" })
    } catch (err) {
        res.status(400).json({ message: "Something went wrong!" })
    }
})

// DIY

// 5. Get a specific blog - No need to auth
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found!" })
        }

        res.json(blog)
    } catch (err) {
        res.status(500).json({ message: "Something went wrong!" })
    }
})

module.exports = router;