var passport = require('passport');
var moment 					= require('moment');

var User            = require('./models/user');
var Bill            = require('./models/bill');


module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});


	app.get('/bill', isLoggedIn, function(req,res){
		res.render('new-bill.ejs');
	});

	app.post('/bill', isLoggedIn, function(req,res){
		// console.log(req.body);
		Bill.create({
			dueDate    : moment(req.body.dueDate).format("L"),
      company     : req.body.company,
      minimum  : req.body.minimum,
			type: req.body.type,
			amountPaid: 0,
      paid : req.body.hasOwnProperty('paid'),
			recurring: req.hasOwnProperty('recurring'),
      _creator: req.user._id
		},function(err,bill){
			res.redirect('/profile');
		});
		// res.send(200);
	});

	app.put('/paid/:id/:bool', isLoggedIn, function(req, res) {
		Bill.findOneAndUpdate({_id:req.params.id},{$set:{paid:req.params.bool}},{new:true},function(err,bill){
			res.redirect('/profile');
		});
	});

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

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('login message') });
	});

	    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', {message: req.flash('signupMessage') });
	});

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));

	app.get('/profile', isLoggedIn, function(req, res) {
		var date = moment().format("LL");
		var total = 0;
		var totalPaid = 0;
		Bill.find({_creator:req.user._id},function(err,bills){
			bills.forEach(function(bill,index){
				total += bill.minimum;
				totalPaid += bill.amountPaid;
			});
			res.render('profile.ejs', {
				user: req.user,
				bills: bills,
				total: total,
				date: date,
				totalPaid: totalPaid
			});
		});
	});

	app.get('/test-repeats', isLoggedIn, function(req,res){
		checkForRepeatBills();
	});

	function checkForRepeatBills(){

	}

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
