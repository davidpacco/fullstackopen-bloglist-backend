const { test, describe } = require('node:test')
const assert = require('node:assert')

const { blogs, mostBlogs } = require('../utils/list_helper')

describe('most blogs', () => {
  test('when list is empty, is undefined', () => {
    assert.strictEqual(mostBlogs([]), undefined)
  })

  test('when list has only one blog, is the author of that blog', () => {
    assert.deepStrictEqual(mostBlogs([blogs[0]]), {
      author: "Michael Chan",
      blogs: 1
    })
  })

  test('of a bigger list is calculated right', () => {
    assert.deepStrictEqual(mostBlogs(blogs), {
      author: "Robert C. Martin",
      blogs: 3
    })
  })
})