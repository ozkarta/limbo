var mongoose=require('mongoose');

module.exports=mongoose.model('feedBack',{
	feedbackGUID 			:String,
	effDate					:String,

	from					:String,  //GUID  
	to						:String,  //GUID  
	for 					:String,  //JOB GUID  

	feedbackText			:String,
	feedbackScore			:String
})