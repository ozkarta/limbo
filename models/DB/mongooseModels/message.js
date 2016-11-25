var mongoose=require('mongoose');

module.exports=mongoose.model('message',{
	messageGUID				:String,
	senderGUID				:String,

	effDate					:String,
	messageBody				:String

})