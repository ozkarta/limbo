var mongoose=require('mongoose');

module.exports=mongoose.model('messageHistory',{
	messageHistoryGUID			:String,	
	leftUserGUID					:String,
	rightUserGUID					:String,
	linkedJobGUID					:String,

	effDate							:String,
	message 						:[]

})