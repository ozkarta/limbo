var translator=require('./mongooseModels/translator');
var jobCategory=require('./mongooseModels/jobCategory');
module.exports=function(){

	initTranslator();

	initJobCategory();

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
function initJobCategory(){

	jobCategory.remove({},function(err){
		if(!err){
			var fix=createToJobCategory('xeloba/sheketeba');
				fix.subCategory.push(createToJobCategory('სახლი'));
				fix.subCategory.push(createToJobCategory('outdoor'));
				fix.subCategory.push(createToJobCategory('avto/moto'));
				fix.subCategory.push(createToJobCategory('eleqtro teqnika'));
			var transport=createToJobCategory('გადაზიდვა');
				transport.subCategory.push(createToJobCategory('ავტო ტრანსპორტირება'));
				transport.subCategory.push(createToJobCategory('საშენი მასალა'));
				transport.subCategory.push(createToJobCategory('საკვები პროდუქტი'));
				transport.subCategory.push(createToJobCategory('ნარჩენების გატანა/გადაზიდვა'));
				transport.subCategory.push(createToJobCategory('სახლის ტექნიკის/ავეჯის ტრანსპორტირება'));
				transport.subCategory.push(createToJobCategory('ადამიანების ტრანსპორტირება'));
			var store=createToJobCategory('წარმოება / საწყობი');
				store.subCategory.push(createToJobCategory('საშენი მასალა'));
				store.subCategory.push(createToJobCategory('საკვები პროდუქცია'));
				store.subCategory.push(createToJobCategory('თამბაქო'));
				store.subCategory.push(createToJobCategory('ალკოჰოლი'));
				store.subCategory.push(createToJobCategory('საავტომობილოო ნაწილები'));
				store.subCategory.push(createToJobCategory('ელექტრო ტექნიკა'));
			var hr=createToJobCategory('Human Resourses');
				hr.subCategory.push(createToJobCategory('მუშა'));
				hr.subCategory.push(createToJobCategory('ინფორმაციული ტექნოლოგიები'));
				hr.subCategory.push(createToJobCategory('ეკონომისტი'));
				hr.subCategory.push(createToJobCategory('მენეჯმენტი'));
				hr.subCategory.push(createToJobCategory('მარკეტინგი'));
				hr.subCategory.push(createToJobCategory('გაყიდვები'));
				hr.subCategory.push(createToJobCategory('იურიდიული'));
				hr.subCategory.push(createToJobCategory('სასტუმრო/რესტორანი/კვება'));
				hr.subCategory.push(createToJobCategory('ჯანდაცვა'));
				hr.subCategory.push(createToJobCategory('დაცვა/უსაფრთხოება'));
				hr.subCategory.push(createToJobCategory('ელექტრო ინჟინერია'));
				hr.subCategory.push(createToJobCategory('ტურიზმი'));
				hr.subCategory.push(createToJobCategory('დიზაინი'));
				hr.subCategory.push(createToJobCategory('განათლება'));
				hr.subCategory.push(createToJobCategory('სპორტი'));
			
			var montage=createToJobCategory('მონტაჟი');
				montage.subCategory.push(createToJobCategory('უსაფრთხოების სისტემები'));
				montage.subCategory.push(createToJobCategory('ქსელური მოწყობილობები'));
				montage.subCategory.push(createToJobCategory('გათბობიბ სისტემები'));
				montage.subCategory.push(createToJobCategory('ვენტილაციის სისტემები'));
				montage.subCategory.push(createToJobCategory('საირიგაციო სისტემები'));

				fix.save(function(err,result){
					//console.dir(result);
				});
				transport.save(function(err,result){
					//console.dir(result);
				});
				store.save(function(err,result){
					//console.dir(result);
				});
				hr.save(function(err,result){
					//console.dir(result);
				});
				montage.save(function(err,result){
					//console.dir(result);
				});
			}

		
	});
	
}	
function createToJobCategory(categoryVarName){
	var cat=new jobCategory();
	cat.categoryGUID=guid();
	cat.categoryVarName=categoryVarName;
	cat.subCategory=[];
	// cat.save(function(err,savedResult){
	// 	console.log('Category _'+categoryVarName+'_  was added');
	// })
	return cat;
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