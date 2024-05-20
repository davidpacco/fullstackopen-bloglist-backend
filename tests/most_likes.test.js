const { test, describe } = require('node:test')
const assert = require('node:assert')

const { blogs, mostLikes } = require('../utils/list_helper')

describe('most likes', () => {
  test('of empty list is undefined', () => {
    assert.strictEqual(mostLikes([]), undefined)
  })

  test('when list has only one blog, is the author of that blog', () => {
    assert.deepStrictEqual(mostLikes([blogs[0]]), {
      author: "Michael Chan",
      likes: 7
    })
  })

  test('of a bigger list is calculated right', () => {
    assert.deepStrictEqual(mostLikes(blogs), {
      author: "Edsger W. Dijkstra",
      likes: 17
    })
  })
})