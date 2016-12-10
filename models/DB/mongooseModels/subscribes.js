var mongoose=require('mongoose');

module.exports=mongoose.model('subscribes',{
	subscribeGUID			:String,
	effDate					:String,

	subscriberGUID			:String,
	subscriberPriority		:String,			//  Worker,Admin,Client ....
	subscribedPersonGUID	:String,
	subscribedPriority		:String,			//  Worker,Admin,Client ....
	action					:String

})