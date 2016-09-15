var mongoose=require('mongoose');

module.exports=mongoose.model('jobpost',{
	jobGUID			:String,
	createDate		:String,
	effDate			:String,

	ownerGUID		:String,
	jobCategory		:String,
	jobTitle		:String,
	jobDescription	:String,
	deadLine		:String,
	budget			:String,

	paymentType		:String,		//fixed  or  hourly
	projectType		:String,		//  ongoing   or   one-time

	status			:String,		//active ,finished , inProggress, cancelled, moderation,


	requirements	:[],
	candidates		:[],
	imageURLList	:[],
	atachmentList	:[]

})