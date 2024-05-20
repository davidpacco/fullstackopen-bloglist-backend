const { test, describe } = require('node:test')
const assert = require('node:assert')

const { blogs, favoriteBlog } = require('../utils/list_helper')

describe('favorite blog', () => {
  test('when list is empty, is undefined', () => {
    assert.strictEqual(favoriteBlog([]), undefined)
  })

  test('when list has only one blog, is the blog itsef', () => {
    assert.deepStrictEqual(favoriteBlog([blogs[0]]), blogs[0])
  })

  test('of a bigger list is calculated right', () => {
    assert.deepStrictEqual(favoriteBlog(blogs), blogs[2])
  })
})