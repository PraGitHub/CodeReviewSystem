var dbHandler = require(__dirname+'/DatabaseHandler.js');
var defines = require(__dirname+'/Defines.js');
var fs = require('fs');

var fpGetHttpPort = function GetHttpPort(){
    var strPort = "";
    for(let i=0;i<process.argv.length;i++){
        var strArg = process.argv[i];
        if(strArg.indexOf('-port=')>-1){
            strPort = strArg.substr(6);
        }
    }
    if(strPort == ""){
        strPort = 8085;
    }
    return strPort;
}

var fpAddProjectDropDown = function AddProjectDropDown(strHTMLPath){
    var strHTML = fs.readFileSync(strHTMLPath).toString();
    var strKeyWord = '<!--PROJECTDROPDOWN-->';
    var iPos = strHTML.indexOf(strKeyWord);
    var strPreProjectDropDown = strHTML.substr(0,iPos+strKeyWord.length);
    var strPostProjectDropDown = strHTML.substr(iPos+strKeyWord.length);
    var strProjectDropDown = '<select class="form-control" name="projectname">';
    strProjectDropDown += '<option value="#NOTHING#">None</option>'
    /*
    Fill strProjectDropDown with proper html format with project list
        Obtain Project list from database.
        Compose the HTML
    */
   var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.projects,{},0);
   console.log('AddProjectDropDown :: jsonResponse = ',jsonResponse);
   if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
        arrayjsonProject = jsonResponse.arrayjsonResult;
        for(let i in arrayjsonProject){
            var jsonProject = arrayjsonProject[i];
            //console.log('AddProjectDropDown :: jsonProject = ',jsonProject);
            strProjectDropDown += '<option "'+jsonProject.title+'">'+jsonProject.title+'</option>';
            //Form a proper dropdown
        }
   }
   strProjectDropDown += '</select>';
    var strToReturn = strPreProjectDropDown+strProjectDropDown+strPostProjectDropDown;
    return strToReturn;
}

var fpIsSuperuser = function IsSuperuser(strUsername,strPassword){
    /*
    Check for that username an password in 'SuperUser' collection
    return true or false based on the existence
    */
   var bRetVal = false;
   var jsonData = {
       username:strUsername.toUpperCase(),
       password:strPassword
   };
   var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.superusers,jsonData);
   if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
       bRetVal = true;
   }
   //console.log(jsonResponse);
   return bRetVal;
}

var fpInsertProject = function InsertProject(strProjectName,strUserName){
    /*
    If exists return a message - Project name exists
    Else Insert and return a message - Successfully added. 
        In case of any error then return that error message
    */
   var jsonData = {title:strProjectName.toUpperCase()};
   var strToReturn = '';
   jsonResponse = dbHandler.Query(defines.dbDefines.Collection.projects,jsonData);
   if(jsonResponse.iResult == defines.dbDefines.Code.DataNotFound){
       jsonData['addedby'] = strUserName.toUpperCase();
       jsonResponse = dbHandler.Insert(defines.dbDefines.Collection.projects,jsonData);
       if(jsonResponse.iResult == defines.dbDefines.Code.DataAdded){
           strToReturn = strProjectName +' is added to database';
       }
       else{
           console.log('InsertProject :: Data cannot be added',jsonResponse);
           strToReturn = 'Failure in adding '+strProjectName+' to database';
       }
   }
   else{
       strToReturn = strProjectName + ' already exists in database';
   }
   return strToReturn;
}

var fpGetHTMLResponse = function GetHTMLResponse(JSONInputs = {
    'message':'This function is called without any message',
    'alert':'primary'
}){
    /*
    Compose a html message based on the alert type. Return the string containing that message
    */
   var strToReturn = '';
   strToReturn = fs.readFileSync(__dirname+'/Result.html').toString();
   strToReturn += '<br>';
   strToReturn += '<div class="container-fluid">';
   strToReturn += '<div class="row">';
   strToReturn += '<div class="col-7">';
   strToReturn += '<div class="alert alert-'+JSONInputs.alert+'">';
   strToReturn += '<strong><pre>';
   strToReturn += JSONInputs.message;
   strToReturn += '</pre></strong>';
   strToReturn += '</div>';
   strToReturn += '</div>';
   strToReturn += '<div class="col-2">';
   strToReturn += '</div>';
   strToReturn += '<div class="col-3">';
   strToReturn += '<ul class="nav nav-pills bg-dark flex-column">';
   strToReturn += '<li class="nav-item border-bottom">';
   strToReturn += '<a class="nav-pills nav-link text-white" href="/">Home</a>';
   strToReturn += '</li>';
   strToReturn += '</ul>';
   strToReturn += '</div>';
   strToReturn += '</div>';
   strToReturn += '</div>';
   strToReturn += '<br>';
   return strToReturn;
}

module.exports.GetHttpPort = fpGetHttpPort;
module.exports.AddProjectDropDown = fpAddProjectDropDown;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.InsertProject = fpInsertProject;
module.exports.GetHTMLResponse = fpGetHTMLResponse;
module.exports.InsertProject = fpInsertProject;
module.exports.IsSuperuser = fpIsSuperuser;