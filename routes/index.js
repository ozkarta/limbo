express=require('express');
var mongoose=require('mongoose');
var dbInit=require('../models/DB/initDataBase');
var dbConfig=require('../models/DB/db');
var user=require('../models/DB/mongooseModels/users');
var jobPost=require('../models/DB/mongooseModels/jobPost');
var jobCategory=require('../models/DB/mongooseModels/jobCategory');

var permition=require('../models/permition');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var LocalStrategy = require('passport-local').Strategy;


mongoose.connect(dbConfig.url,function(err){
	if(!err){
		console.log('connected to mongo');
		new dbInit();
	}else{
		console.dir(err);
	}	
});




myRouter=function(app,_passport){
		this.router=express.Router();
		this.passport=_passport;
		app.set('layout','layouts/visitor_layout');


		//PASSPORT  CONFIGURATIONS
		this.passport.serializeUser(function(user, done) {
				  done(null, user._id);
				});
		 
		this.passport.deserializeUser(function(id, done) {
		  user.findById(id, function(err, user) {
		    done(err, user);
		  });
		});

		this.passport.use('local-signup',new LocalStrategy({
		    usernameField: 'userName',
		    passwordField: 'password',
		    passReqToCallback : true // allows us to pass back the entire request to the callback
		  },
		  function(req,username, password, done) {
		  	//console.log('___________________________----')
		  	//console.dir(req.body);
		    user.findOne({ 'worker.userName': username }, function (err, userResult) {
		     
		    	if(!err){
		    		if(!userResult){
		    			var newUser=new user();
		    			
		    			
		    			if(req.body.type==='worker'){
		    				console.dir(newUser.worker);

			    			var salt = bcrypt.genSaltSync(saltRounds);
							var hash = bcrypt.hashSync(req.body.password, salt);

		    				newUser.worker.userGUID=guid();
							newUser.worker.effDate=getDate();
							newUser.worker.authenticationMethod='local';
							newUser.worker.lastVisited=getDate();
							newUser.worker.emailConfirmed='false';
							newUser.worker.active='false';

							// newUser.worker.userName=req.body.userName;
							// newUser.worker.email=req.body.email;
							// newUser.worker.fName=req.body.fname;
							// newUser.worker.lName=req.body.lname;
							console.log('registering WORKER!!!');
							var filled=false;
							if(req.body.whoami==='company'){
								//console.log('WORKER Registration   of company');
								

								newUser.worker.businessName=req.body.businessname;	
							    newUser.worker.controlNumber=req.body.controlnumber;		
							    newUser.worker.businessType=req.body.businesstype;	
							    newUser.worker.principalOfficeAddress=req.body.principalofficeaddress;
							    newUser.worker.registrationDate=req.body.registrationdate;

								
								newUser.worker.userName=req.body.userName;
								newUser.worker.email=req.body.email;
								newUser.worker.fName=req.body.fname;
								newUser.worker.lName=req.body.lname;
								  
								newUser.worker.whoAmI=req.body.whoami;
								  
								 
								filled=true;

							}
							if(req.body.whoami==='individual'){
								//console.log('WORKER Registration   of individual');
								newUser.worker.userName=req.body.userName;
								newUser.worker.email=req.body.email;
								newUser.worker.fName=req.body.fname;
								newUser.worker.lName=req.body.lname;
								  
								newUser.worker.whoAmI=req.body.whoami;

								filled=true;
							}



							newUser.worker.passwordHash=hash;
							newUser.worker.userRole=req.body.type;
							if(filled){
								newUser.save(function(err,result){
				    				if(!err){
				    					console.log('new user saved succesfully');
				    					return done(null,result);
				    				}
			    				})	
							}else{
								return done(null,null);
							}
												
		    			}

		    			if(req.body.type==='client'){
		    				//console.dir(newUser.client);

			    			var salt = bcrypt.genSaltSync(saltRounds);
							var hash = bcrypt.hashSync(req.body.password, salt);

		    				newUser.client.userGUID=guid();
							newUser.client.effDate=getDate();
							newUser.client.authenticationMethod='local';
							newUser.client.lastVisited=getDate();
							newUser.client.emailConfirmed='false';
							newUser.client.active='false';

							newUser.client.userName=req.body.userName;
							newUser.client.email=req.body.email;
							newUser.client.fName=req.body.fname;
							newUser.client.lName=req.body.lname;

							newUser.client.passwordHash=hash;
							newUser.client.userRole=req.body.type;

							newUser.save(function(err,result){
			    				if(!err){
			    					console.log('new user saved succesfully');
			    					return done(null,result);
			    				}
			    			})						
		    			}   
		    		}else{
		    			return done(null, null);
		    		}
		    	}else{
		    		return done(null, null);
		    	}

		      
		    });
		  }
		));

		this.passport.use('local-signin',new LocalStrategy({
		    usernameField: 'userName',
		    passwordField: 'password',
		    passReqToCallback : true // allows us to pass back the entire request to the callback
		  },
		  function(req,username, password, done) {
		  	//console.dir(req.body);
		  	user.findOne({$or:[{'worker.userName':req.body.userName},{'client.userName':req.body.userName}]},function(err,fResult1){
		  		
		  		//console.dir(req.body.password);
		  		//console.dir(fResult1);

		  		if(!err){
		  			if(fResult1){
		  				var passwordHash='';
				  		if(fResult1.worker.passwordHash!==undefined){
				  			passwordHash=fResult1.worker.passwordHash;
				  		}
				  		if(fResult1.client.passwordHash!==undefined){
				  			passwordHash=fResult1.client.passwordHash;
				  		}

				  		if(!err){
				  			if(fResult1){
				  				if(bcrypt.compareSync(req.body.password, passwordHash)){
				  					return done(null,fResult1);
				  				}else{
				  					return done(null,null);
				  				}		  				
				  			}else{
				  				return done(null,null);
				  			}
				  		}else{
				  			console.dir(err);
				  		}
				  			}else{
				  				return done(null,null);
				  			}
				  		}else{
				  			return done(null,null);
				  		}
		  		
		  	})
		  }));

		//DEfault     Value





		//___________________________VISITOR___________

		this.router.get('/',function(req,res,next){
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=true;
			localPermition.worker=true;

			renderIfAuthorized(req,res,app,'index',localPermition);

			//res.render('visitor/index');
		})

		this.router.get('/signUp',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=false;
			localPermition.worker=false;

			renderIfAuthorized(req,res,app,'signUpQueue',localPermition);

			//res.render('visitor/signUpQueue');
		});

		this.router.get('/logIn',function(req,res,next){
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=false;
			localPermition.worker=false;	


			renderIfAuthorized(req,res,app,'login',localPermition);

			//res.render('visitor/login');
		});

		this.router.get('/registerClient',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=false;
			localPermition.worker=false;


			renderIfAuthorized(req,res,app,'registerClient',localPermition);

			//res.render('visitor/registerClient');
		});
		this.router.get('/registerWorker',function(req,res,next){
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=false;
			localPermition.worker=false;


			renderIfAuthorized(req,res,app,'registerWorker',localPermition);

			//res.render('visitor/registerWorker');
		});


		this.router.post('/registerClientAction',this.passport.authenticate('local-signup', {
		        successRedirect : '/', // redirect to the secure profile section
		        failureRedirect : '/error'
		    })
		);

		this.router.post('/registerWorkerAction',this.passport.authenticate('local-signup', {
		        successRedirect : '/', // redirect to the secure profile section
		        failureRedirect : '/error'
		    })
		);


		this.router.get('/profile',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=true;

			
			renderIfAuthorized(req,res,app,'userProfile',localPermition);



			//res.render('client/userProfile');
		});

		this.router.post('/logInAction',this.passport.authenticate('local-signin', {
		        successRedirect : '/', // redirect to the secure profile section
		        failureRedirect : '/error'
		    })
		);
		this.router.get('/logOut',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=true;

			if(isAuthorized(req,res,app,'/',localPermition)){
				req.logOut();
			}
			renderIfAuthorized(req,res,app,'index',localPermition);

			//res.render('visitor/registerClient');
		});

		this.router.get('/postJob',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;

			if(isAuthorized(req,res,app,'postJob',localPermition)){
				jobCategory.find({},function(err,result){
					renderIfAuthorized(req,res,app,'postJob',localPermition,{locals:{categories:result}});
				})
			}
			//renderIfAuthorized(req,res,app,'postJob',localPermition);

			//res.render('visitor/registerClient');
		});

		this.router.post('/postNewJob',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;

			if(isAuthorized(req,res,app,'/',localPermition)){
				//console.dir(req.body);
				var newJobPost=new jobPost();
				newJobPost.jobGUID=guid();
				newJobPost.effDate=getDate();
				newJobPost.ownerGUID=req.user.client.userGUID;
				newJobPost.jobCategory=req.body.category;
				newJobPost.jobTitle=req.body.title;
				newJobPost.jobDescription=req.body.description;
				newJobPost.deadLine=req.body.deadline;
				newJobPost.budget=req.body.budget;
				newJobPost.paymentType=req.body.paymentType;
				newJobPost.projectType=req.body.projectType;
				newJobPost.status='Active';
				newJobPost.save(function(err,savedJobPost){
					if(!err){
						if(savedJobPost){
							//console.log('Job Post Saved Succesfully');
						}else{
							//console.log('problem saving data');
						}
					}else{
						//console.dir(err);
					}
					renderIfAuthorized(req,res,app,'index',localPermition);
				});
			}else{
				renderIfAuthorized(req,res,app,'index',localPermition);
			}
			

			//res.render('visitor/registerClient');
		});

		this.router.get('/clientJobHistory',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;


			if(isAuthorized(req,res,app,'clientJobHistory',localPermition)){
				jobPost.find({ownerGUID:req.user.client.userGUID},function(err,result){
					if(result){
						renderIfAuthorized(req,res,app,'clientJobHistory',localPermition,{locals:{clientPostedJobs:result}});
					}
					//console.dir(result);
					//renderIfAuthorized(req,res,app,'clientJobHistory',localPermition,{locals:{clientPostedJobs:result}});
				});
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
			

			

			//res.render('visitor/registerClient');
		});

		this.router.get('/editJobPost',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;


			if(isAuthorized(req,res,app,'editJobPost',localPermition)){
				jobPost.findOne({ownerGUID:req.user.client.userGUID,jobGUID:req.query.id},function(err,result){
					//console.dir(result);
					jobCategory.find({},function(err2,result2){
							if(!err){
								if(result2){
									renderIfAuthorized(req,res,app,'editJobPost',localPermition,{locals:{jobToEdit:result,categories:result2}});
						
								}
							}
						})
					
				});
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
			

			

			//res.render('visitor/registerClient');
		});
		//______________________________________________

		this.router.post('/updateJobPost',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;


			if(isAuthorized(req,res,app,'clientJobHistory',localPermition)){
				jobPost.findOne({ownerGUID:req.user.client.userGUID,jobGUID:req.body.id},function(err,result){
					console.dir(req.body);
					if(result){
						result.effDate=getDate();
						result.jobCategory=req.body.category;
						result.jobTitle=req.body.title;
						result.jobDescription=req.body.description;
						result.deadLine=req.body.deadLine;
						result.budget=req.body.budget;
						result.paymentType=req.body.paymentType;
						result.projectType=req.body.projectType;

						if(req.body.status=='on'){
							result.status='Active';
						}else{
							result.status='Disabled';
						}
						

						result.save(function(err,saved){
							if(saved){
								res.redirect('/clientJobHistory');
							}else{
								res.redirect('/');
							}
						})
					}else{
						res.redirect('/clientJobHistory');
					}
					
					//renderIfAuthorized(req,res,app,'clientJobHistory',localPermition,{locals:{jobToEdit:result}});
					
				});
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
			

			

			//res.render('visitor/registerClient');
		});
}
function renderIfAuthorized(req,res,app,view,permition,locals){
	//console.dir(locals);
	
	if(req.isAuthenticated()){
		console.log('authenticated user')
			if(req.user.worker.userGUID!==undefined){
				app.set('layout','layouts/worker_layout');
				if(permition.worker){
					res.render('worker/'+view,locals);
				}else{
					res.redirect('/')
				}
				
				//return next();
			}
			if(req.user.client.userGUID!==undefined){
				app.set('layout','layouts/client_layout');
				if(permition.client){
					res.render('client/'+view,locals);
				}else{
					res.redirect('/')
				}
				
				//return next();
			}
	}else{
		console.log('not authenticated(((((((')
		app.set('layout','layouts/visitor_layout');
		if(permition.visitor){
			res.render('visitor/'+view,locals);		
		}else{
			res.redirect('/')
		}
	 	
	 	//return next();
	}
	
	 
}
function isAuthorized(req,res,app,view,permition){
	//console.dir(permition);
	
	if(req.isAuthenticated()){
		console.log('authenticated user')
			if(req.user.worker.userGUID!==undefined){
				//app.set('layout','layouts/worker_layout');
				if(permition.worker){
					return true;
				}else{
					return false;
				}
				
				//return next();
			}
			if(req.user.client.userGUID!==undefined){
				
				if(permition.client){
					return true;
				}else{
					return false;
				}
				
				//return next();
			}
	}else{
		
		if(permition.visitor){
			return true;
		}else{
			return false;
		}
	 	
	 	//return next();
	}
	
	 
}
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function getDate(){
	var currentdate = new Date(); 
    var month=''
    if((''+currentdate.getMonth()).length==1){
        month='0'+(currentdate.getMonth()+1);
    }else{
        month=currentdate.getMonth();;
    }

    var day=''
    if((''+currentdate.getDate()).length==1){
        day='0'+currentdate.getDate();
    }else{
        day=currentdate.getDate();
    }
    var datetime = currentdate.getFullYear()+'-'+month+'-'+day;
    return datetime;
}



module.exports.myRouter=myRouter;