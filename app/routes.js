var passport = require('passport');
var moment 					= require('moment');

var User            = require('./models/user');
var Bill            = require('./models/bill');


module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});




// **********POST REQUEST TO CREATE A BILL***********
	app.post('/bill', isLoggedIn, function(req,res){
		// console.log(req.body);
		Bill.create({
			dueDate    : moment(req.body.dueDate).format("L"),
      company     : req.body.company,
      minimum  : req.body.minimum,
			type: req.body.type,
			amountPaid: 0,
      paid : false,
			recurring: req.body.recurring,
      _creator: req.user._id
		},function(err,bill){
			if(bill.recurring == true){
				Bill.create({
					dueDate    : moment(req.body.dueDate).add(1, 'M').format("L"),
					company     : req.body.company,
					minimum  : req.body.minimum,
					type: req.body.type,
					amountPaid: 0,
					paid : false,
					recurring: req.body.recurring,
					_creator: req.user._id
				});
			}
			res.redirect('/profile');
		});
		// res.send(200);
	});




// **********UPDATE PAID BOOL FROM CHECKBOX***********
	app.put('/paid/:id/:bool', isLoggedIn, function(req, res) {
		Bill.findOneAndUpdate({_id:req.params.id},{$set:{paid:req.params.bool}},{new:true},function(err,bill){
			res.send(200);
		});
	});




// **********UPDATES AMOUNT PAID FROM THE AMOUNT PAID FIELD***********
	app.put('/amount-paid/:id/:amount', isLoggedIn, function(req, res) {
		Bill.findOneAndUpdate({_id:req.params.id},{$set:{amountPaid:req.params.amount}},{new:true},function(err,bill){
			res.send(200);
		});
	});



// **********DELETES A BILL***********
	app.get('/bill-delete/:id',isLoggedIn,function(req,res){
		Bill.findOne({_id:req.params.id},function(err,bill){
			if(bill._creator == req.user._id){
				Bill.findOneAndRemove({_id:req.params.id},function(err,data){
					res.redirect('/profile');
				});
			} else {
				res.redirect('/profile');
			}
		});
	});




// **********TAKES TO LOGIN SCREEN***********
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('login message') });
	});



// **********PROCESS LOGIN FORM***********
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));




// **********SIGN UP***********
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', {message: req.flash('signupMessage') });
	});

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));




// **********LOADS USERS PROFILE***********
	app.get('/profile', isLoggedIn, function(req, res) {
		var date = moment().format("LL");
		var total = 0;
		var totalPaid = 0;
		var start = moment().subtract(15, 'days').format("L");
		var end = moment().add(15, 'days').format('L');

		Bill.find({
			_creator:req.user._id,
			dueDate: {
				$gte: start,
				$lte: end
			}},function(err,bills){
			bills.forEach(function(bill,index){
				total += bill.minimum;
				totalPaid += bill.amountPaid;
			});
			res.render('profile.ejs', {
				user: req.user,
				name: req.user.local.first + ' '+req.user.local.last,
				bills: bills,
				total: total,
				date: date,
				totalPaid: totalPaid,
				difference: total + -totalPaid,
				start: start,
				end: end,
			});
		});
	});


	app.get('/all-bills', isLoggedIn, function(req, res) {
		var date = moment().format("LL");
		var total = 0;
		var totalPaid = 0;
		var start = moment().subtract(15, 'days').format("L");
		var end = moment().add(15, 'days').format('L');

		Bill.find({
			_creator:req.user._id,
			},function(err,bills){
			res.render('all-bills.ejs', {
				user: req.user,
				name: req.user.local.first + ' '+req.user.local.last,
				bills: bills,
				total: total,
				date: date,
				totalPaid: totalPaid,
				difference: total + -totalPaid,
				start: start,
				end: end,
			});
		});
	});

	// app.get('/test-repeats', isLoggedIn, function(req,res){
	// 	checkForRepeatBills();
	// });
	//
	// function checkForRepeatBills(req, res){
	// 	Bill.find({
	// 		_creator: req.user._id,
	// 		recurring: true
	// 	}), function(err,bills){
	// 		bills.forEach(function(bill, index){
	// 			console.log(bill);
	// 			Bill.create({
	// 				dueDate    : moment(bill.dueDate).add(1, 'M').format("L"),
	// 				company     : bill.company,
	// 				minimum  : bill.minimum,
	// 				type: bill.type,
	// 				amountPaid: 0,
	// 				paid : false,
	// 				recurring: true,
	// 				_creator: req.user._id
	// 			});
	// 		});
	// 	}
	// }

	app.get('/account-info', function(req, res) {
		res.render('account.ejs', { message: req.flash('login message') });
	});



	app.get('/logout', function(req, res) {
    	req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
