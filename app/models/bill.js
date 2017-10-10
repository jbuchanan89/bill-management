  const mongoose = require('mongoose');
  const moment = require('moment');
  var billSchema = mongoose.Schema({
      dueDate    : {
        type: String,
        required: true,
      },
      type       : {
        type: String,
        required: true,
      },
      company    : {
        type: String,
        required: true,
      },
      minimum    : {
        type: Number,
        required: true,
      },
      amountPaid: {type: Number, default: 0},
      paid : Boolean,
      recurring: Boolean,
      _creator: String
  });

  module.exports = mongoose.model('Bill', billSchema);
