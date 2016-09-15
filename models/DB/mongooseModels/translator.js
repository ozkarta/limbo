var mongoose=require('mongoose');

module.exports=mongoose.model('translator',{
	language 			:String,
	varGUID				:String,
	effDate				:String,
	varName				:String,
	value 				:String	
})