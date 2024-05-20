const { test, describe } = require('node:test')
const assert = require('node:assert')

const blogs = require('../utils/list_helper').blogs
const totalLikes = require('../utils/list_helper').totalLikes

describe('total likes', () => {
  test('of empty list is zero', () => {
    assert.strictEqual(totalLikes([]), 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    assert.strictEqual(totalLikes([blogs[1]]), 5)
  })

  test('of a bigger list is calculated right', () => {
    assert.strictEqual(totalLikes(blogs), 36)
  })
})