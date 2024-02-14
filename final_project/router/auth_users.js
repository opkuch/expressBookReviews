const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const JWT_SECRET = require('../consts').JWT_SECRET
const regd_users = express.Router()

let users = []

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  })
  return !(userswithsamename.length > 0)
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password
  })
  return validusers.length > 0
}

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' })
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 }
    )

    req.session.authorization = {
      accessToken,
      username,
    }
    return res.status(200).send('User successfully logged in')
  } else {
    return res
      .status(208)
      .json({ message: 'Invalid Login. Check username and password' })
  }
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { review } = req.query
  if (!review) {
    return res.status(400).json({ message: 'Missing review text and rating!' })
  }
  const isbn = +req.params.isbn
  const username = req?.user?.data
  const book = books[isbn]
  if (book) {
      book.reviews[username] = review
      return res.send(
        `${username} has added/modified a review for book with isbn ${isbn}`
      )
  } else {
    return res
      .status(404)
      .json({ message: 'Cannot find a book matching input isbn' })
  }
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = +req.params.isbn
  const username = req?.user?.data
  const book = books[isbn]
  if (book) {
    if (username in book.reviews) {
      delete book.reviews[username]
      res.send(
        `${username} review has been deleted from book with isbn ${isbn}!`
      )
    } else {
      res
        .status(404)
        .json({ message: 'Could not find a review made by this user!' })
    }
  } else {
    res
      .status(404)
      .json({ message: 'Could not find a book matching input isbn' })
  }
})

module.exports = {
  authenticated: regd_users,
  isValid,
  users,
}
