require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = new mongoose.model('Blog', blogSchema)

mongoose.connect(process.env.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (req, res) => {
  Blog.find({}).then(blogs => res.json(blogs))
})

app.post('/api/blogs', (req, res) => {
  const { title, author, url, like } = req.body

  const blog = new Blog({ title, author, url, like })

  blog
    .save()
    .then(savedBlog => res.status(201).json(savedBlog))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})