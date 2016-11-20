var mongoose=require('mongoose');

module.exports=mongoose.model('offers',{
		offerGUID			:String,
		//categorySystemName		:String,   //  kategoriis  saxeli  sistemuri
		offer				:String,
		offerGlyphName		:String
});