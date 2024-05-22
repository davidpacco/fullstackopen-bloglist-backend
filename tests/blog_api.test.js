const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('../utils/test_helper')
const mongoose = require('mongoose')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blogs id property exists', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const keys = response.body.map(e => Object.keys(e))

  assert(keys.every(e => e.includes('id')))
  assert(keys.every(e => !e.includes('_id')))
})


test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Testing Blog",
    author: "Alan Turing",
    url: "https://testblog.com/",
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  for (let key in newBlog) {
    assert.strictEqual(newBlog[key], response.body[key])
  }

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
})

test('if likes property is missing, it is set to zero', async () => {
  const newBlog = {
    title: "Testing Blog",
    author: "Alan Turing",
    url: "https://testblog.com/"
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes, 0)
})

after(async () => {
  await mongoose.connection.close()
})