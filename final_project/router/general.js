const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const axios = require('axios')
const public_users = express.Router()

public_users.post('/register', (req, res) => {
  const { username, password } = req.body
  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password })
      return res.json({ message: 'User registered successfully!' })
    } else {
      return res.status(404).json({ message: 'User already exist!' })
    }
  } else {
    return res.status(404).json({ message: 'Unable to register user.' })
  }
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send({ books })
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = +req.params?.isbn
  const book = books[isbn]
  if (book) {
    res.send(book)
  } else {
    res.status(404).json({ message: 'Could not find a book matching the isbn' })
  }
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author
  const filtered_books_by_author = Object.values(books).filter(
    (book) => book?.author === author
  )
  if (filtered_books_by_author.length > 0) {
    return res.send({ bookbyauthor: filtered_books_by_author })
  } else {
    return res
      .status(404)
      .json({ message: 'Could not find books by input author' })
  }
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title
  const filtered_books_by_title = Object.values(books).filter(
    (book) => book?.title === title
  )
  if (filtered_books_by_title.length > 0) {
    return res.send({ booksbytitle: filtered_books_by_title })
  } else {
    return res
      .status(404)
      .json({ message: 'Could not find books with input title' })
  }
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = +req.params?.isbn
  const book = books[isbn]
  if (book) {
    res.send(book.reviews)
  } else {
    res.status(404).json({ message: 'Could not find a book matching the isbn' })
  }
})

// TASK 10, 11, 12, 13
const SERVER_URL = 'http://localhost:5000'
function getBooks(callback) {
  axios
    .get(SERVER_URL)
    .then((res) => {
      const books = res.data
      callback(books)
    })
    .catch((err) => {
      console.log(err)
    })
}

async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${SERVER_URL}/${isbn}`)
    const book = response.data
    return book
  } catch (err) {
    console.error(err)
  }
}

async function getBookByAuthor(author) {
  try {
    const res = await axios.get(`${SERVER_URL}/author/${author}`)
    const book = res.data
    return book
  } catch (err) {
    console.error(err)
  }
}

async function getBookByTitle(title) {
  try {
    const res = await axios.get(`${SERVER_URL}/title/${title}`)
    const book = res.data
    return book
  } catch (err) {
    console.error(err)
  }
}

module.exports.general = public_users
