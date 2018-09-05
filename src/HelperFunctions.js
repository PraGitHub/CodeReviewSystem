var dbHandler = require(__dirname+'/DatabaseHandler.js');
var defines = require(__dirname+'/Defines.js');
var fs = require('fs');
var jsonPaths = {};
var listKeysOfjsonPaths = ['src','html'];

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

var fpGetHTMLResponse = function GetHTMLResponse(JSONInputs = {
    'message':'This function is called without any message',
    'alert':'primary'
},bIncludeHeader = true){
    /*
    Compose a html message based on the alert type. Return the string containing that message
    */
   var strToReturn = '';
   if(bIncludeHeader == true){
    strToReturn = fs.readFileSync(jsonPaths.html+'/Result.html').toString();
    strToReturn += '<br>';
   }
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
   if(bIncludeHeader == true){
    strToReturn += '<ul class="nav nav-pills bg-dark flex-column">';
    strToReturn += '<li class="nav-item border-bottom">';
    strToReturn += '<a class="nav-pills nav-link text-white" href="/">Home</a>';
    strToReturn += '</li>';
    strToReturn += '</ul>';
   }
   strToReturn += '</div>';
   strToReturn += '</div>';
   strToReturn += '</div>';
   strToReturn += '<br>';
   return strToReturn;
}

var fpAddProjectDropDown = function AddProjectDropDown(strHTMLPath){
    var strHTML = fs.readFileSync(strHTMLPath).toString();
    var strKeyWord = '<!--PROJECTDROPDOWN-->';
    var iPos = strHTML.indexOf(strKeyWord);
    var strPreProjectDropDown = strHTML.substr(0,iPos+strKeyWord.length);
    var strPostProjectDropDown = strHTML.substr(iPos+strKeyWord.length);
    var strProjectDropDown = '<select class="selectpicker form-control" multiple data-live-search="true" name="projectname">';
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
    var strToReturn = strPreProjectDropDown+'<br>'+strProjectDropDown+'<br>'+strPostProjectDropDown;
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
   var jsonData = {title:strProjectName.toUpperCase()};
   var strHtmlResponse = '';
   var jsonResponse = {};
   jsonResponse['message'] = '';
   jsonResponse['alert'] = '';

   jsonResponse = dbHandler.Query(defines.dbDefines.Collection.projects,jsonData);
   if(jsonResponse.iResult == defines.dbDefines.Code.DataNotFound){
       jsonData['addedby'] = strUserName.toUpperCase();
       jsonResponse = dbHandler.Insert(defines.dbDefines.Collection.projects,jsonData);
       if(jsonResponse.iResult == defines.dbDefines.Code.DataAdded){
           jsonResponse.message = strProjectName +' is added to database';
           jsonResponse.alert = 'success';
       }
       else{
           console.log('InsertProject :: Data cannot be added',jsonResponse);
           jsonResponse.message = 'Failure in adding '+strProjectName+' to database';
           jsonResponse.alert = 'danger';
       }
   }
   else{
    jsonResponse.message = strProjectName + ' already exists in database';
    jsonResponse.alert = 'info';
   }
   strHtmlResponse = fpGetHTMLResponse(jsonResponse);
   return strHtmlResponse;
}

var fpDeleteProject = function DeleteProject(arrayProjectName){
    var strHtmlResponse = '';
    var bSeekHeader = true;
    for(let i in arrayProjectName){
        var strProjectName = arrayProjectName[i];
        var jsonData = {title:strProjectName.toUpperCase()};
        var jsonResponse = {};
        jsonResponse['message'] = '';
        jsonResponse['alert'] = '';
        jsonResponse = dbHandler.Delete(defines.dbDefines.Collection.projects,jsonData);
        if(jsonResponse.iResult == defines.dbDefines.Code.Error){
            jsonResponse.message = 'Error in deleting the project, '+strProjectName;
            jsonResponse.alert = 'danger';
        }
        else if(jsonResponse.iResult == defines.dbDefines.Code.DataNotFound){
            jsonResponse.message = 'Project, "'+strProjectName+'" does not exist in database to delete';
            jsonResponse.alert = 'info';
        }
        else if(jsonResponse.iResult == defines.dbDefines.Code.DataDeleted){
            jsonResponse.message = 'Project, "'+strProjectName+'" has been deleted from the database';
            jsonResponse.alert = 'success';
        }
        else{
            //control will never come here. just in case if it does following will be the result
            jsonResponse.message = 'Delete operation failed due to unknown reason';
            jsonResponse.alert = 'primary';
        }
        if(i>0){
            bSeekHeader = false;
        }
        strHtmlResponse += fpGetHTMLResponse(jsonResponse,bSeekHeader);
        strHtmlResponse += '<br>';
    }
    return strHtmlResponse;
}

function FilljsonPaths(){
    var strParent = __dirname;
    var iIndex = strParent.indexOf('/src');
    if(iIndex < 0){
        iIndex = strParent.indexOf('\\src');
    }
    strParent = strParent.substr(0,iIndex);//this will contain parent or root directory
    jsonPaths['root'] = strParent;
    jsonPaths['parent'] = strParent;
    for(let i in listKeysOfjsonPaths){
        strKey = listKeysOfjsonPaths[i];
        jsonPaths[strKey] = strParent+'/'+strKey;
    }
}

FilljsonPaths();
//console.log(jsonPaths);

module.exports.GetHttpPort = fpGetHttpPort;
module.exports.AddProjectDropDown = fpAddProjectDropDown;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.InsertProject = fpInsertProject;
module.exports.DeleteProject = fpDeleteProject;
module.exports.GetHTMLResponse = fpGetHTMLResponse;
module.exports.InsertProject = fpInsertProject;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.jsonPaths = jsonPaths;