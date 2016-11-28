express=require('express');
var mongoose=require('mongoose');
var dbInit=require('../models/DB/initDataBase');
var dbConfig=require('../models/DB/db');
var user=require('../models/DB/mongooseModels/users');
var jobPost=require('../models/DB/mongooseModels/jobPost');
var jobCategory=require('../models/DB/mongooseModels/jobCategory');
var offer=require('../models/DB/mongooseModels/offers');
var proposal=require('../models/DB/mongooseModels/proposals');
var messageHistory=require('../models/DB/mongooseModels/messageHistory');
var messageObject=require('../models/DB/mongooseModels/message');



var permition=require('../models/permition');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var LocalStrategy = require('passport-local').Strategy;


var cookie = require('cookie');
var cookieParser = require('cookie-parser')
var url = require('url');

mongoose.connect(dbConfig.url,function(err){
	if(!err){
		console.log('connected to mongo');
		new dbInit();
	}else{
		console.dir(err);
	}	
});




myRouter=function(app,_passport,io,wss,store){
		this.router=express.Router();
		this.passport=_passport;
		app.set('layout','layouts/visitor_layout');
		//   SOCKET>IO
		var connectedWSUsers=[];

		wss.on('connection', function connection(ws) {
		  
		  var location = url.parse(ws.upgradeReq.url, true);
		  
		  // you might use location.query.access_token to authenticate or share sessions 
		  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312) 
		  //console.dir(ws.upgradeReq);
		  var cookies=cookie.parse(ws.upgradeReq.headers.cookie);
    	  var sid=cookieParser.signedCookie(cookies["connect.sid"],'limbo_secret_keyword');


    	  store.get(sid, function (err, ss) {
    	  	//console.dir(ss);



    	  	

    	  	ws.on('message', function incoming(message) {
			    

			    initSession(ss,ws,function(){

			    	console.log('exited callback');
			    	console.log('received: %s', message +' from SID '+sid);
			    	var connectionJSON=JSON.parse(message);
			    	//console.dir(connectionJSON);

			    	var client=undefined;
			    	// console.log('______________WORKER');
			    	// console.log(ws.upgradeReq.session.mongoObject.worker.userGUID);
			    	// console.log('______________CLIENT');
			    	// console.log(ws.upgradeReq.session.mongoObject.client.userGUID);
			    	


			    	if(ws.upgradeReq.session.mongoObject.client.userGUID!==undefined){
			    		client=ws.upgradeReq.session.mongoObject.client;
			    	}
			    	if(ws.upgradeReq.session.mongoObject.worker.userGUID!==undefined){
			    		client=ws.upgradeReq.session.mongoObject.worker;
			    	}

			    	//console.dir(user);
			    	var sender=client.userGUID;
			    	if(connectionJSON!==undefined){
			    		if(connectionJSON.action!==undefined){
			    			if(connectionJSON.action=='messageTo'){
			    				if(connectionJSON.receiver!==''){
				    				newMessageHistory(messageHistory,sender,connectionJSON.to,function(result){
				    					
				    					var userSearchArray=[];

				    					for(i=0;i<result.length;i++){
				    						var obj1={};
				    						var obj2={};
				    						obj1['client.userGUID']=result[i].leftUserGUID;
				    						obj2['worker.userGUID']=result[i].rightUserGUID;
				    						userSearchArray.push(obj1);
				    						userSearchArray.push(obj2);
				    					}

				    					user.find({$or:userSearchArray},function(userSearchErr,foundList){
				    						if(!userSearchErr){
				    							if(foundList){
				    								responseJSON={};
				    								responseJSON.result=result;
				    								responseJSON.userList=foundList;

				    								ws.send(JSON.stringify(responseJSON));
				    							}
				    						}
				    					})


				    					//console.dir(result);
				    					//ws.send(JSON.stringify(result));
				    				});
			    				}
			    			}
			    			if(connectionJSON.action=='getDefaultList'){
			    				getMessagesDB(messageHistory,sender,function(result){
			    					//console.dir(result);
			    					var userSearchArray=[];

			    					for(i=0;i<result.length;i++){
			    						var obj1={};
			    						var obj2={};
			    						obj1['client.userGUID']=result[i].leftUserGUID;
			    						obj2['worker.userGUID']=result[i].rightUserGUID;
			    						userSearchArray.push(obj1);
			    						userSearchArray.push(obj2);
			    					}
			    					console.dir(userSearchArray);


			    					user.find({$or:userSearchArray},function(userSearchErr,foundList){
			    						if(!userSearchErr){
			    							if(foundList){
			    								responseJSON={};
			    								responseJSON.result=result;
			    								responseJSON.userList=foundList;

			    								ws.send(JSON.stringify(responseJSON));
			    							}
			    						}
			    					});

			    					//ws.send(JSON.stringify(result));
			    				});
			    			}
			    			if(connectionJSON.action=='newMessage'){
			    				var to=connectionJSON.to;
			    				var from=connectionJSON.from;
			    				var body=connectionJSON.body;
			    				var historyGUID=connectionJSON.history;

			    				sendMessageDB(messageHistory,messageObject,from,to,historyGUID,body,function(newMessage){
			    					sendMessageToConnectedClients(connectedWSUsers,from,to,newMessage);
			    				});
			    			}
			    		}
			    	}

			    	
			    });
			    	
			  });

    	  });


		ws.on('open', function open() {
		  console.log('___________________connected');
		  // initSession(ss,function(){

		  // });
		});
		 
		ws.on('close', function close() {
		  console.log('___________________disconnected');
		  for(i=connectedWSUsers.length-1;i>=0;i--){
		  	// if(connectedWSUsers[i].userObject.__id===ws.upgradeReq.session.mongoObject._id.toString()){
		  	// 	console.log('we must remove this');
		  	// }
		  	if(connectedWSUsers[i].ws.readyState===connectedWSUsers[i].ws.CLOSED){
		  		connectedWSUsers.splice(i,1);
		  	}
		  }
		});
		 
		  //ws.send('something');

		  function initSession(ss,ws,callback){
		  	//console.dir(ss);
		  	if(ws.upgradeReq.session){

		    	  		if(ws.upgradeReq.session.mongoObject!==undefined){
		    	  			//console.dir((ws.upgradeReq.session.mongoObject._id).toString());
		    	  			if((ws.upgradeReq.session.mongoObject._id).toString()!==ss.passport.user){
				    	  		user.findOne({'_id':ss.passport.user},function(err,foundUser){
				    	  			if(!err){
				    	  				if(foundUser){
				    	  					var type;
				    	  					var userObject;
				    	  					if(foundUser.worker.userGUID!==undefined){
				    	  						type='worker';
				    	  						userObject=foundUser.worker;
				    	  					}
				    	  					if(foundUser.client.userGUID!==undefined){
				    	  						type='client';
				    	  						userObject=foundUser.client;
				    	  					}
				    	  					var addOrNot=true;
				    	  					// for(u=0;u<connectedWSUsers.length;u++){
				    	  					// 	if(connectedWSUsers[u].userGUID===ss.passport.user.userGUID){
				    	  					// 		addOrNot=false;
				    	  					// 	}
				    	  					// }

				    	  					for(u=connectedWSUsers.length-1;u>=0;u--){
				    	  						if(connectedWSUsers[u].userGUID===ss.passport.user.userGUID){
				    	  							addOrNot=false;
				    	  						}				    	  						
				    	  					}
				    	  					if(addOrNot){
				    	  						userObject.userRole   =undefined;
				    	  						userObject.passwordHistory   =undefined;
				    	  						userObject.passwordResetGUID   =undefined;
				    	  						userObject.email   =undefined;
				    	  						userObject.authenticationMethod   =undefined;

				    	  						connectedWSUsers.push({__id:ss.passport.user,userGUID:userObject.userGUID,type:type,user:userObject,ws:ws});
				    	  					
				    	  					}


				    	  					ss.mongoObject=foundUser;
				    	  					//console.dir(ss);
				    	  					store.createSession(ws.upgradeReq, ss);
				    	  					console.log('New User was assigned   1');
				    	  					//console.dir(ws.upgradeReq.session.passport.user);
				    	  					callback();
				    	  				}else{
				    	  					ws.send('No User was not found');
				    	  					console.log('new user was not found');
				    	  					callback();
				    	  				}
				    	  			}else{
				    	  				ws.send('Something went wrong');
				    	  				console.log('something went wrong');
				    	  				callback();
				    	  			}
				    	  		});    	  		
				    	  	}else{
				    	  		console.log('user exists in session');
				    	  		callback();
				    	  	}
		    	  		}
		    	  		
		    	  	
		    	  	}else{
		    	  		user.findOne({'_id':ss.passport.user},function(err,foundUser){
			    	  			if(!err){
			    	  				if(foundUser){
			    	  					var type;
				    	  					var userObject;
				    	  					if(foundUser.worker.userGUID!==undefined){
				    	  						type='worker';
				    	  						userObject=foundUser.worker;
				    	  					}
				    	  					if(foundUser.client.userGUID!==undefined){
				    	  						type='client';
				    	  						userObject=foundUser.client;
				    	  					}
				    	  					var addOrNot=true;
				    	  					// for(u=0;u<connectedWSUsers.length;u++){
				    	  					// 	if(connectedWSUsers[u].userGUID===ss.passport.user.userGUID){
				    	  					// 		addOrNot=false;
				    	  					// 	}
				    	  					// }

				    	  					for(u=connectedWSUsers.length-1;u>=0;u--){
				    	  						if(connectedWSUsers[u].userGUID===ss.passport.user.userGUID){
				    	  							addOrNot=false;
				    	  						}				    	  						
				    	  					}
				    	  					if(addOrNot){
				    	  						userObject.userRole   =undefined;
				    	  						userObject.passwordHistory   =undefined;
				    	  						userObject.passwordResetGUID   =undefined;
				    	  						userObject.email   =undefined;
				    	  						userObject.authenticationMethod   =undefined;
				    	  						

				    	  						connectedWSUsers.push({__id:ss.passport.user,userGUID:userObject.userGUID,type:type,user:userObject,ws:ws});
				    	  						//console.dir(userObject);
				    	  					
				    	  					}


			    	  					ss.mongoObject=foundUser;
			    	  					//console.dir(ss);
			    	  					store.createSession(ws.upgradeReq, ss);
			    	  					console.log('New User was assigned    2');
			    	  					//console.dir(ws.upgradeReq.session.passport.user);
			    	  					callback();
			    	  				}else{
			    	  					ws.send('No User was not found');
			    	  					console.log('new user was not found');
			    	  					callback();
			    	  				}
			    	  			}else{
			    	  				ws.send('Something went wrong');
			    	  				console.log('something went wrong');
			    	  				callback();
			    	  			}
			    	  		});
		    	  	}
		  }
		});

		

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
		  	console.dir(req.body);
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
		  	console.dir(req.body);
		  	user.findOne({$or:[{'worker.userName':req.body.userName},{'client.userName':req.body.userName}]},function(err,fResult1){
		  		
		  		//console.dir(req.body.password);
		  		console.dir(fResult1);

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
				  					console.log('success  !!!!!!!!!!!');
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

			//renderIfAuthorized(req,res,app,'index',localPermition);


			if(req.isAuthenticated()){
				if(req.user.client.userGUID!==undefined){
					//console.dir(user);
					user.find({'worker.userGUID':{$ne:null}},function(err,workerResult){
						if(!err){
							if(workerResult){
								//console.dir(workerResult.length);
								renderIfAuthorized(req,res,app,'index',localPermition,{locals:{workers:workerResult}});
							}
						}						
					})
				}
				if(req.user.worker.userGUID!==undefined){
					jobPost.find({},function(err,jobsResult){
						if(!err){
							if(jobsResult){
								renderIfAuthorized(req,res,app,'index',localPermition,{locals:{defaultJobs:jobsResult}});
							}
						}
					})

					
				}
			}else{
				renderIfAuthorized(req,res,app,'index',localPermition);
			}
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

		this.router.post('/updateJobPost',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;


			if(isAuthorized(req,res,app,'clientJobHistory',localPermition)){
				

			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
			

			

			//res.render('visitor/registerClient');
		});

		this.router.get('/messages',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;

			renderIfAuthorized(req,res,app,'messageBox',localPermition);

			//res.render('visitor/signUpQueue');
		});


		this.router.get('/workerProfile',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=true;
			localPermition.worker=true;

			var workerID=req.query.id;

			

			

			if(isAuthorized(req,res,app,'workerProfile',localPermition)){
				user.findOne({'worker.userGUID':workerID},function(err,workerResult){
					if(!err){
						if(workerResult){
							renderIfAuthorized(req,res,app,'worker',localPermition,{locals:{worker:workerResult}});
						}
					}
				});
			}else{
				renderIfAuthorized(req,res,app,'error',localPermition);
			}
			//res.render('visitor/signUpQueue');
		});

		this.router.get('/account',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=true;

			renderIfAuthorized(req,res,app,'account',localPermition,{locals:{user:req.user}});

			//res.render('visitor/signUpQueue');
		});

		this.router.get('/settings',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;

			renderIfAuthorized(req,res,app,'settings',localPermition);

			//res.render('visitor/signUpQueue');
		});


		this.router.post('/updateGeneralInformation',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=false;
			localPermition.worker=true;

			//renderIfAuthorized(req,res,app,'settings',localPermition);

			//res.render('visitor/signUpQueue');
			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){
				//console.dir(req.body);


				user.findOne({'worker.userGUID':req.user.worker.userGUID},function(err,workerResult){
					if(!err){
						if(workerResult){
							workerResult.worker.aboutCompany=req.body.aboutyou;
							workerResult.worker.mission=req.body.mission;
							workerResult.worker.vission=req.body.vission;


							workerResult.save(function(err,result){
								if(!err){
									res.redirect('/account');
								}else{
									res.redirect('/');
								}
							})
						}else{
							console.log('No Such User Found!!!');
							res.redirect('/');
						}
					}else{
						console.dir(err);
						res.redirect('/');
					}
				});



				
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
		});

		this.router.post('/updateContactInformation',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=false;
			localPermition.worker=true;

			//renderIfAuthorized(req,res,app,'settings',localPermition);

			//res.render('visitor/signUpQueue');
			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){
				//console.dir(req.body);


				user.findOne({'worker.userGUID':req.user.worker.userGUID},function(err,workerResult){
					if(!err){
						if(workerResult){
							workerResult.worker.contactAddress=req.body.contactAddress;
							workerResult.worker.contactEmail=req.body.contactEmail;
							workerResult.worker.contactPhoneNumber=req.body.contactPhoneNumber;


							workerResult.save(function(err,result){
								if(!err){
									res.redirect('/account');
								}else{
									res.redirect('/');
								}
							})
						}else{
							console.log('No Such User Found!!!');
							res.redirect('/');
						}
					}else{
						console.dir(err);
						res.redirect('/');
					}
				});



				
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
		});

		this.router.post('/updateOffers',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=false;
			localPermition.worker=true;


			console.dir(req.body);
			//renderIfAuthorized(req,res,app,'settings',localPermition);

			//res.render('visitor/signUpQueue');
			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){
				//console.dir(req.body);

				var offers=[];

				user.findOne({'worker.userGUID':req.user.worker.userGUID},function(err,workerResult){
					if(!err){
						if(workerResult){
							workerResult.worker.services=[];

							if(req.body.offer1!==''){

								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer1;
								off.offerGlyphName=req.body.offerGlyph1;

								workerResult.worker.services.push(off);
								
							}
							

							if(req.body.offer2!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer2;
								off.offerGlyphName=req.body.offerGlyph2;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer3!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer3;
								off.offerGlyphName=req.body.offerGlyph3;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer4!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer4;
								off.offerGlyphName=req.body.offerGlyph4;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer5!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer5;
								off.offerGlyphName=req.body.offerGlyph5;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer6!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer6;
								off.offerGlyphName=req.body.offerGlyph6;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer7!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer7;
								off.offerGlyphName=req.body.offerGlyph7;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer8!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer8;
								off.offerGlyphName=req.body.offerGlyph8;
								
								workerResult.worker.services.push(off);
							}
							

							if(req.body.offer9!==''){
								
								var off=new offer();
								off.offerGUID=guid();
								off.offer=req.body.offer9;
								off.offerGlyphName=req.body.offerGlyph9;
								
								workerResult.worker.services.push(off);
							}
							



							workerResult.save(function(err,result){
								if(!err){
									res.redirect('/account');
								}else{
									res.redirect('/');
								}
							})
						}else{
							console.log('No Such User Found!!!');
							res.redirect('/');
						}
					}else{
						console.dir(err);
						res.redirect('/');
					}
				});



				
			}else{
				renderIfAuthorized(req,res,app,'/',localPermition);
			}
		});





		this.router.get('/jobDescription',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=true;
			localPermition.client=true;
			localPermition.worker=true;

			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){




				jobPost.findOne({'jobGUID':req.query.id},function(err,jobFound){
					if(!err){
						if(jobFound){
							user.findOne({'client.userGUID':jobFound.ownerGUID},function(err1,ownerFound){
								if(!err1){
									if(ownerFound){
										proposal.findOne({jobGUID:req.query.id,jobOwnerGUID:jobFound.ownerGUID,candidadeGUID:req.user.worker.userGUID},function(err2,proposalFound){
											if(!err2){
												if(proposalFound){
													console.dir(proposalFound);
													renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,owner:ownerFound,user:req.user,previousProposal:proposalFound}});
												}else{
													renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,owner:ownerFound,user:req.user}});
												}
											}else{
												renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,owner:ownerFound,user:req.user}});
											}
										})
										//renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,owner:ownerFound,user:req.user}});
									}else{
										renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,user:req.user}});
									}
								}else{
									renderIfAuthorized(req,res,app,'jobDescription',localPermition,{locals:{job:jobFound,user:req.user}});
								}
							})
							
						}else{
							res.redirect('/');
						}
					}else{
						res.redirect('/');
					}
				})
			}

			

			//res.render('visitor/signUpQueue');
		});

		this.router.post('/applyJob',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=false;
			localPermition.worker=true;

			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){

				console.dir(req.body);

				myProposal=new proposal();

				myProposal.proposalGUID=guid();				
				myProposal.jobOwnerGUID=req.body.jobOwner;
				myProposal.jobGUID=req.body.jobGUID;
				myProposal.candidadeGUID=req.body.userGUID;	
				myProposal.effDate=getDate();				
				myProposal.offeredPrice=req.body.price;
				myProposal.duration=req.body.duration;
				myProposal.coverLetter	=req.body.coverLetter;
				myProposal.whyToChoose	=req.body.whyYouFit;
				myProposal.status='applied';	

				myProposal.save(function(err,result){
					if(!err){
						if(result){
							res.redirect('/jobDescription?id='+req.body.jobGUID);
						}else{
							res.redirect('/');
						}
					}else{
						res.redirect('/');
					}
				});



			
			}			
		});


		this.router.get('/offers',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=false;

			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){

				jobPost.find({'ownerGUID':req.user.client.userGUID},function(errJob,jobArray){
					if(!errJob){
						if(jobArray){
							console.log(req.user.client.userGUID);
							proposal.find({'jobOwnerGUID':req.user.client.userGUID},function(errProp,propArray){
								if(!errProp){
									if(propArray){
										var candidateGUIDArray=[];
										for(i=0;i<propArray.length;i++){
											var myObjWorker={};
											var myObjClient={};
											myObjWorker['worker.userGUID']=propArray[i].candidadeGUID;
											myObjClient['client.userGUID']=propArray[i].candidadeGUID;	

											candidateGUIDArray.push(myObjWorker);									
											candidateGUIDArray.push(myObjClient);
										}
										console.dir(candidateGUIDArray);

										user.find({$or:candidateGUIDArray},function(errFindingUsers,foundUserArray){
											if(!errFindingUsers){
												if(foundUserArray){
													console.dir(foundUserArray);
													renderIfAuthorized(req,res,app,'offers',localPermition,{locals:{proposals:propArray,jobs:jobArray,user:req.user,candidadeUsers:foundUserArray}});
												}else{
													renderIfAuthorized(req,res,app,'offers',localPermition,{locals:{proposals:propArray,jobs:jobArray,user:req.user}});
												}
											}else{
												renderIfAuthorized(req,res,app,'offers',localPermition,{locals:{proposals:propArray,jobs:jobArray,user:req.user}});
											}
										})

										//renderIfAuthorized(req,res,app,'offers',localPermition,{locals:{proposals:propArray,jobs:jobArray,user:req.user}});
									}else{
										res.redirect('/');
									}
								}else{
									res.redirect('/');
								}
							});
						}else{
							res.redirect('/');
						}
					}else{
						res.redirect('/');
					}
				});
			
				
			
			}else{
				res.redirect('/');
			}			
		});


		this.router.get('/messenger',function(req,res,next){	
			var localPermition=new permition();
			localPermition.visitor=false;
			localPermition.client=true;
			localPermition.worker=true;

			if(isAuthorized(req,res,app,'updateGeneralInformation',localPermition)){

				var receiver=req.query.candidade;

				renderIfAuthorized(req,res,app,'messenger',localPermition,{locals:{receiver:receiver,sender:req.user}});

			
			}	else{
				res.redirect('/');
			}		
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


    var hour='';
    hour=currentdate.getHours();


    var minute='';
    minute=currentdate.getMinutes();

    var second='';
    second=currentdate.getSeconds();

    var milliSecond='';
    milliSecond=currentdate.getMilliseconds();

    var datetime = currentdate.getFullYear()+'-'+month+'-'+day+'  '+hour+'-'+minute+'-'+second+'-'+milliSecond;
    return datetime;
}
//   ______________MESSenger
function getMessageDB(messageHistory,sender,receiver,messageHistoryGUID,callback){

}
function getMessagesDB(messageHistory,sender,callback){
	messageHistory.find({$or:[{leftUserGUID:sender},{rightUserGUID:sender}]},function(err,result){
		if(!err){
			callback(result);
		}else{
			callback(undefined);
		}
	});
}
function newMessageHistory(messageHistory,sender,receiver,callback){
	
	messageHistory.find({$or:[{leftUserGUID:sender,rightUserGUID:receiver},{leftUserGUID:receiver,rightUserGUID:sender}]},function(error,found){
		if(!error){
			if(found){
				if(found.length>0){
					getMessagesDB(messageHistory,sender,callback);
				}else{
					newMessageHistoryObject=new messageHistory();
					newMessageHistoryObject.messageHistoryGUID=guid();
					newMessageHistoryObject.leftUserGUID=sender;
					newMessageHistoryObject.rightUserGUID=receiver;
					newMessageHistoryObject.effDate=getDate();

					newMessageHistoryObject.save(function(err,result){
						if(!err){
							getMessagesDB(messageHistory,sender,callback);
						}
					});
				}
			}
		}
	})	
}
function sendMessageDB(messageHistory,message,sender,receiver,messageHistoryGUID,messageBody,callback){
	newMessage=new message();
	newMessage.messageGUID=guid();
	newMessage.effDate=getDate();
	newMessage.senderGUID=sender;
	newMessage.messageBody=messageBody;


	messageHistory.findOne({'messageHistoryGUID':messageHistoryGUID},function(err,result){
		if(!err){
			if(result){
				result.message.push(newMessage);
				result.save(function(err,saved){
					if(!err){
						if(saved){
							console.log('new message saved !!!');
							callback(newMessage);
						}else{
							callback(undefined);
						}
					}else{
							callback(undefined);
					}
				})
			}
		}
	})
}

function sendMessageToConnectedClients(wsClientList,senderGUID,receiverGUID,messageJSON){
	var resultJSON={
				action:'updateMessage',
				message:messageJSON,
				sender:senderGUID,
				receiver:receiverGUID
			};
	//console.dir(wsClientList);
	for(i=0;i<wsClientList.length;i++){
		if(wsClientList[i].userGUID===senderGUID || wsClientList[i].userGUID===receiverGUID){
			
			if(wsClientList[i].ws.readyState===wsClientList[i].ws.OPEN){
				console.log(wsClientList[i].type+'   is connected');
				console.log('trying to send  message .......')
				try{
					wsClientList[i].ws.send(JSON.stringify(resultJSON));
				}catch(ex){
					console.log('Exception was thrown!!');
					console.dir(ex);
				}
				
				console.log('message was sent!!!');
			}else{
				console.log('NOT CONNECTED');
			}
		}
	}

}

module.exports.myRouter=myRouter;