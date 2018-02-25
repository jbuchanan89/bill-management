var passport 			= require('passport');
var moment 					= require('moment');
var cron 					= require('node-cron');

var User            = require('./models/user');
var Bill            = require('./models/bill');


module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	cron.schedule('0 0 * * *', function(){
		console.log('----checking for repeat bills----');
	  checkForRepeatBills();
	});


// **********POST REQUEST TO CREATE A BILL***********
	app.post('/bill', isLoggedIn, function(req,res,err){
		//console.log(req.body);
		//console.log(req.body.dueDate,moment(req.body.dueDate).valueOf(),moment(req.body.dueDate, "YYYY-MM-DD").format("L"));
		Bill.create({
			dueDate    : moment(req.body.dueDate,"YYYY-MM-DD").valueOf(),
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
					dueDate    : moment(req.body.dueDate, "YYYY-MM-DD").add(1, 'M').valueOf(),
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
		// if(err){
		// 	return done(null, false, req.flash('addBillMessage', 'Please Complete All Fields'));
		// }
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



// **********DELETES A BILL FROM /PROFILE***********
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



// **********DELETES A BILL FROM /ALL-BILLS***********
	app.get('/all-bills-delete/:id',isLoggedIn,function(req,res){
		Bill.findOne({_id:req.params.id},function(err,bill){
			if(bill._creator == req.user._id){
				Bill.findOneAndRemove({_id:req.params.id},function(err,data){
					res.redirect('/all-bills');
				});
			} else {
				res.redirect('/all-bills');
			}
		});
	});




// **********TAKES TO LOGIN SCREEN***********
	app.get('/login', function(req, res) {
		res.render('index.ejs', { message: req.flash('login message') });
	});



// **********PROCESS LOGIN FORM***********
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));




// **********SIGN UP***********
	app.get('/signup', function(req, res) {
		res.render('index.ejs', {message: req.flash('signupMessage') });
	});

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));




// **********LOADS USERS PROFILE**********
	app.get('/date',function(req,res){
	res.send("{date:"+moment("01/14/2018").valueOf()+"}");
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		var date = moment().format("LL");
		var total = 0;
		var totalPaid = 0;
		var startStamp = moment().subtract(15, 'days').valueOf();
		var start = moment().subtract(15, 'days').format("LL");
		var endStamp = moment().add(15, 'days').valueOf();
		var end = moment().add(15, 'days').format('LL');
		var today = moment().valueOf();

		console.log(typeof end);
		console.log("start",start,"end",end);
	
		Bill.find({
			_creator:req.user._id,
			dueDate: {
				$gte: startStamp,
				$lte: endStamp}
			},function(err,bills){
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
				moment: moment,
				today: today
			});
		});
	});

// ******** LOADS ALL BILLS**************
	app.get('/all-bills', isLoggedIn, function(req, res) {
		var date = moment().format("LL");
		console.log(date);
		Bill.find({
			_creator:req.user._id,
		},null,{
			sort: {
				dueDate: 1
			}
		},function(err,bills){
			res.render('all-bills.ejs', {
				user: req.user,
				name: req.user.local.first + ' '+req.user.local.last,
				bills: bills,
				date: date,
				moment: moment
			});
		});
	});

	app.get('/test-repeats', function(req,res){
		// console.log('168');
		checkForRepeatBills();
		res.send(200);
	});

	function checkForRepeatBills(){
		Bill.find({
			recurring: true,
			dueDate: { $gt: moment().add(1,'M').valueOf(), $lt: moment().add(2,'M').valueOf() }
		}, function(err,bills){
			if(!err){
				bills.forEach(function(bill, index){
					Bill.find({
						dueDate: moment(bill.dueDate,"L").add(1, 'M').format("L"),
						_creator: bill._creator,
						company: bill.company,
						recurring: true
					},function(err,data){
						if(!err){
							if(data.length==0){
								// console.log('The bill',bill.company,'due on',bill.dueDate,'will be duplicated for the next month');
								Bill.create({
									dueDate    : moment(bill.dueDate,"L").add(1, 'M').valueOf(),
									company     : bill.company,
									minimum  : bill.minimum,
									type: bill.type,
									amountPaid: 0,
									paid : false,
									recurring: true,
									_creator: bill._creator
								});
							} else {
								// console.log('The bill',bill.company,'due on',bill.dueDate,'ALREADY has a duplicate');
							}
						}
					})
					// console.log(bill);

				});
				// res.send(bills);
			} else {
				// console.error(err);
				// res.send(err);
			}
		});
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
