require('dotenv').config()

const SECRET = process.env.SECRET
const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.SECRET

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
}
