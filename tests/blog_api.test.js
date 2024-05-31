const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
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

test('error is handled if title property is missing', async () => {
  const newBlog = {
    author: "Alan Turing",
    url: "https://testblog.com/",
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('error is handled if url property is missing', async () => {
  const newBlog = {
    title: "Testing Blog",
    author: "Alan Turing",
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('a blog can be deleted', async () => {
  const blogsAtFirst = await helper.blogsInDb()
  const blogToDelete = blogsAtFirst[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtFirst.length - 1)

  const contents = blogsAtEnd.map(e => e.title)
  assert(!contents.includes(blogToDelete.title))
})

test('a blog likes can be updated', async () => {
  const blogsAtFirst = await helper.blogsInDb()
  const blogToUpdate = blogsAtFirst[0]

  const blogUpdate = {
    likes: 100
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogUpdate)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd[0].likes, 100)
})

describe.only('creation of a user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('testing', 10)

    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test.only('fails when username is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'te', password: 'testpass' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('is shorter than the minimum allowed length (3)'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('fails when username already exists', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'root', password: 'rootpass' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test.only('fails when password is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = { username: 'test', password: 'te' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('password must be at least 3 characters'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})