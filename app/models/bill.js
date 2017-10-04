  const mongoose = require('mongoose');
  const moment = require('moment');
  var billSchema = mongoose.Schema({
      dueDate    : String,
      type       : String,
      company    : String,
      minimum    : Number,
      amountPaid: {type: Number, default: 0},
      paid : Boolean,
      recurring: Boolean,
      _creator: String
  });

  module.exports = mongoose.model('Bill', billSchema);
