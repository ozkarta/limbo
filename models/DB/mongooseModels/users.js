var mongoose=require('mongoose');

module.exports=mongoose.model('users',{
	worker:{
		userGUID				:String,
		effDate					:String,
		lastVisited				:String,
		authenticationMethod   	:String,            //Local, FB  , google ........
		emailConfirmed			:String,
		active					:String,


		businessName			:String,
	    controlNumber			:String,
	    businessType			:String,
	    principalOfficeAddress	:String,
	    registrationDate		:String,

		userName				:String,
		email 					:String,
		fName					:String,
		lName					:String,

		whoAmI   				:String,           //Company or individual


		passwordHash			:String,
		hash 					:String,
		passwordResetGUID		:String,		//  is generated when  new RESET  is requested  ,  destroy after that
		passwordHistory			:[],			//  effdate, passwordHash,hash,  

		userRole				:String,
	},
	client:{
		userGUID				:String,
		effDate					:String,
		lastVisited				:String,
		authenticationMethod   	:String,            //Local, FB  , google ........
		emailConfirmed			:String,
		active					:String,

		userName				:String,
		email 					:String,
		fName					:String,
		lName					:String,


		passwordHash			:String,
		hash 					:String,
		passwordResetGUID		:String,		//  is generated when  new RESET  is requested  ,  destroy after that
		passwordHistory			:[],			//  effdate, passwordHash,hash,  

		userRole				:String,
	},
	admin:{
		userGUID				:String,
		effDate					:String,
		lastVisited				:String,
		authenticationMethod   	:String,            //Local, FB  , google ........
		emailConfirmed			:String,
		active					:String,

		userName				:String,
		email 					:String,
		fName					:String,
		lName					:String,


		passwordHash			:String,
		hash 					:String,
		passwordResetGUID		:String,		//  is generated when  new RESET  is requested  ,  destroy after that
		passwordHistory			:[],			//  effdate, passwordHash,hash,  

		userRole				:String,
	}
	




})