var mongoose=require('mongoose');

module.exports=mongoose.model('jobStatus',{
	statusGUID				:String,
	statusVariable			:String,
	status 					:String,
	statusScreenName		:String
})