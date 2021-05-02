const { Schema, model } = require('mongoose')

const SessionActive = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  startAt: { type: Date, default: Date.now },
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 6600 * 24 /* 1h */
  }
})

module.exports = model('SessionActive', SessionActive)
