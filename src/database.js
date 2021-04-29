const mongoose = require('mongoose')

const { MONGO_NDB } = process.env

mongoose.connect(
  MONGO_NDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
)

const connection = mongoose.connection

connection.once('open', () => {
  console.log('Signup DB is conected')
})
