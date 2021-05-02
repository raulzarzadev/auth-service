const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const cors = require('cors')
const path = require('path')

const app = express()

// settings

app.set('port', process.env.SIGNUP_PORT || 3015)

app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, './public/views'))
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
  })
)
app.set('view engine', '.hbs')

// middlewares

app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

// routes
app.use('/user', require('./routes/users.routes'))
app.get('/', function (req, res) {
  res.render('home')
})
module.exports = app
