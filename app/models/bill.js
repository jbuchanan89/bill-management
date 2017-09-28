  const mongoose = require('mongoose');
  const moment = require('moment');
  var billSchema = mongoose.Schema({
      dueDate    : String,
      type: String,
      company     : String,
      minimum  : Number,
      amountPaid: Number,
      paid : Boolean,
      recurring: Boolean,
      _creator: String
  });

  module.exports = mongoose.model('Bill', billSchema);
