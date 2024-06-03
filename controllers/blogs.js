const express = require('express')
const blogsRouter = express.Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
  const { title, author, url } = req.body
  const user = req.user

  const blog = new Blog({
    title,
    author,
    url,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true, context: 'query' }
  )

  res.json(updatedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
  const user = req.user
  const blog = await Blog.findById(req.params.id)

  if (!blog) return res.status(204).end()

  if (blog.user.toString() !== user._id.toString()) {
    return res.status(404).json({ error: 'unauthorized' })
  }

  await Blog.findByIdAndDelete(req.params.id)
  user.blogs = user.blogs.filter(blogId => blogId !== blog._id.toString())
  await user.save()

  return res.status(204).end()
})

module.exports = blogsRouter