var mongoose=require('mongoose');

module.exports=mongoose.model('proposals',{
		proposalGUID			:String,
		jobOwnerGUID			:String,
		jobGUID 				:String,
		candidadeGUID			:String,

		effDate					:String,


		offeredPrice			:String,
		duration				:String,
		coverLetter				:String,
		whyToChoose				:String,

		status					:String
});