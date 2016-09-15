var translator=require('./mongooseModels/translator');

module.exports=function(){

	initTranslator();



}

function initTranslator(){
		translator.remove({},function(err){
			if(!err){
					console.log('adding    languageVariables');
					//          Index Page Home (menu) button
					addValueToTranslator('geo','@home','სახლი')
					addValueToTranslator('eng','@home','home')
					//addValueToTranslator('rus','@home','')

					//          Index Page About Us (menu) button
					addValueToTranslator('geo','@aboutus','ჩვენს შესახებ')
					addValueToTranslator('eng','@aboutus','About Us')
					//addValueToTranslator('rus','@aboutus','')

					//          Index Page About Us (menu) button
					addValueToTranslator('geo','@contact','კონტაქტი')
					addValueToTranslator('eng','@contact','Contact')
					//addValueToTranslator('rus','@contact','')
				
			}
		})
}

function addValueToTranslator(language,varName,value){
	var toAdd=new translator();

	toAdd.language=language
	toAdd.varGUID=guid();	
	toAdd.effDate=getDate();
	toAdd.varName=varName;
	toAdd.value=value;

	toAdd.save(function(err,result){
		if(!err){
			if(result){
				console.log('added ('+varName+' : '+value+')');
			}
		}
	})
}


//___________________________________________________--

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function getDate(){
	var currentdate = new Date(); 
    var month=''
    if((''+currentdate.getMonth()).length==1){
        month='0'+(currentdate.getMonth()+1);
    }else{
        month=currentdate.getMonth();;
    }

    var day=''
    if((''+currentdate.getDate()).length==1){
        day='0'+currentdate.getDate();
    }else{
        day=currentdate.getDate();
    }
    var datetime = currentdate.getFullYear()+'-'+month+'-'+day;
    return datetime;
}