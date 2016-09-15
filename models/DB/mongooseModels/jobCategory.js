var mongoose=require('mongoose');

module.exports=mongoose.model('jobCategory',{
		categoryGUID			:String,
		categorySystemName		:String,   //  kategoriis  saxeli  sistemuri
		categoryVarName			:String    //  gadasatargmnad
});