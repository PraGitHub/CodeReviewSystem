var dbHandler = require(__dirname+'/DatabaseHandler.js');
var defines = require(__dirname+'/Defines.js');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var email = require(__dirname+'/eMail.js');
var fs = require('fs');
var strArgs = process.argv.toString();

var fpGetArgument = function GetArgument(strArgKey){
    var iLen = strArgKey.length;
    var iStart;
    var iEnd;
    var strArg = undefined;
    if((iStart = strArgs.indexOf(strArgKey))>-1){
        strArg = strArgs.substr(iStart+iLen);
    }
    if(strArg != undefined && (iEnd = strArg.indexOf(','))>-1){
        strArg = strArg.substr(0,iEnd);
    }
    return strArg;
}

var fpGetHTMLResponse = function GetHTMLResponse(JSONInputs = {
    'message':'This function is called without any message',
    'alert':'primary'
},bIncludeHeader = true){
    /*
    Compose a html message based on the alert type. Return the string containing that message
    */
   var strToReturn = '';
   var strKeyWord = '<!--ADDBODY-->';
   var strEndTags = '';
   if(bIncludeHeader == true){
    strToReturn = fs.readFileSync(defines.Paths.html+'/Result.html').toString();
    var iIndex = strToReturn.indexOf(strKeyWord);
    strEndTags = strToReturn.substr(iIndex+strKeyWord.length);
    strToReturn = strToReturn.substr(0,iIndex+strKeyWord.length);
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
   strToReturn += strEndTags;
   return strToReturn;
}

var fpAddProjectDropDown = function AddProjectDropDown(strHTMLPath){
    var strHTML = fs.readFileSync(strHTMLPath).toString();
    var strKeyWord = '<!--PROJECTDROPDOWN-->';
    var iPos = strHTML.indexOf(strKeyWord);
    var strPreProjectDropDown = strHTML.substr(0,iPos+strKeyWord.length);
    var strPostProjectDropDown = strHTML.substr(iPos+strKeyWord.length);
    var strProjectDropDown = '<select class="selectpicker form-control" multiple data-live-search="true" name="projectname">';
    strProjectDropDown += '<option value="#NOTHING#" selected>None</option>'
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
   var jsonData = {};
   jsonData[defines.userKeys.username] = strUsername.toUpperCase();
   jsonData[defines.userKeys.password] = strPassword;
   var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.superusers,jsonData);
   if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
       bRetVal = true;
   }
   //console.log(jsonResponse);
   return bRetVal;
}

var fpIsExistingUser = function IsExistingUser(strUserName){
    var bRetVal = false;
    var jsonData = {};
    jsonData[defines.userKeys.username] - strUserName.toUpperCase();
    var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.users,jsonData);
    if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
        bRetVal = true;
    }
    return bRetVal;
}

var fpIsExistingMailID = function IsExistingMailID(strMailId){
    var bRetVal = false;
    var jsonData = {};
    jsonData[defines.userKeys.mailid] - strUserName.toUpperCase();
    var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.mailid,jsonData);
    if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
        bRetVal = true;
    }
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

var fpIsAnyKeyUndefined = function IsAnyKeyUndefined(jsonIn){
    var bReturn = true;
    for(let key in jsonIn){
        if(jsonIn[key] == undefined){
            bReturn = false;
            break;
        }
    }
    return bReturn;
}

var fpProcessNewUser = function ProcessNewUser(jsonProfile,strPasswordKey){
    var jsonProfileToDB = {};
    if(jsonProfile == undefined){
        return defines.GenericCodes.InvalidUserData;
    }
    if(fpIsAnyKeyUndefined(jsonProfile) == false){
        return defines.GenericCodes.InvalidUserData;
    }
    if(fpIsExistingUser(jsonProfile['UserName']) == true){
        return defines.GenericCodes.ExistingUser;
    }
    if(fpIsExistingMailID(jsonProfile['MailID']) == true){
        return defines.GenericCodes.ExistingMailId;
    }
    jsonProfileToDB[defines.userKeys.username] = jsonProfile['UserName'].toUpperCase()
    jsonProfileToDB[defines.userKeys.firstname] = jsonProfile['FirstName'].toUpperCase();
    jsonProfileToDB[defines.userKeys.lastname] = jsonProfile['LastName'].toUpperCase();
    jsonProfileToDB[defines.userKeys.mailid] = jsonProfile['MailID'];
    jsonProfileToDB[defines.userKeys.password] = jsonProfile['Password'];
    jsonProfileToDB[defines.userKeys.projects] = jsonProfile['projectname'];
    jsonProfileToDB[defines.userKeys.verified] = false;
    jsonProfileToDB[defines.userKeys.verificationmailsent] = false;
    jsonProfileToDB[defines.userKeys.key] = cryptr.GetKey([jsonProfileToDB[defines.userKeys.username],
                                                           jsonProfileToDB[defines.userKeys.firstname],
                                                           jsonProfileToDB[defines.userKeys.lastname]]);
    var jsonResponseDB = dbHandler.Insert(defines.dbDefines.Collection.users,jsonProfileToDB);
    if(jsonResponse.iResult != defines.dbDefines.Code.DataAdded){
        return defines.GenericCodes.DatabaseError;
    }

    var strMessage = '';
    var strURL = 'http://localhost:8085/user/verification/';
    var jsonTemp = {};
    jsonTemp[defines.userKeys.username] = jsonProfileToDB[defines.userKeys.username];
    jsonTemp[defines.userKeys.password] = jsonProfileToDB[defines.userKeys.userKeys];
    jsonTemp[defines.userKeys.firstname] = jsonProfileToDB[defines.userKeys.firstname];
    jsonTemp[defines.userKeys.lastname] = jsonProfileToDB[defines.userKeys.lastname];
    var strUserData = JSON.stringify(jsonTemp);
    var strEncryptedData = cryptr.Encrypt(strUserData,jsonProfileToDB[defines.userKeys.key]);
    var strEncryptedUsername = cryptr.Encrypt(jsonProfileToDB[defines.userKeys.username],strPasswordKey);
    strURL += strEncryptedUsername;
    strURL += '/';
    strURL += strEncryptedData;
    strMessage += '<p>Please Click the below link to activate your account</p>';
    strMessage += '<br>';
    strMessage += '<a href="'+strURL+'">'+strURL+'</a><br>'

    var jsonResponseMail = email.Send(strPasswordKey,jsonProfileToDB[defines.userKeys.mailid],'Verification Mail',strMessage);
    if(jsonResponseMail.iResult != defines.mailDefines.Success){
        return defines.GenericCodes.MailNotSent;
    }

    return defines.GenericCodes.Success;
}

var fpVerifyNewUser = function VerifyNewUser(strEncrypterUsername,strEncryptedUserdata,strPasswordKey){
    var strUsername = cryptr.Decrypt(strEncrypterUsername,strPasswordKey);
    var jsonQuery = {};
    jsonQuery[defines.userKeys.username] = strUsername.toUpperCase();
    var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.users,jsonQuery);
    if(jsonResponse.iResult != defines.dbDefines.DataNotFound){
        return defines.GenericCodes.UserNotFound;
    }

    var jsonUserProfile = jsonResponse.arrayjsonResult[0];
    var strUserdata = cryptr.Decrypt(strEncryptedUserdata,jsonUserProfile[defines.userKeys.key]);
    var jsonUserdata = JSON.parse(strUserdata);
    for(let key in jsonUserdata){
        if(jsonUserdata[key] != jsonUserProfile[key]){
            return defines.GenericCodes.DataMismatch;
        }
    }

    if(jsonUserProfile[defines.userKeys.verified] == true){
        return defines.GenericCodes.AlreadyVerified;
    }

    var jsonToUpdate = {};
    jsonToUpdate[defines.userKeys.verified] = true;
    jsonResponse = dbHandler.Update(defines.dbDefines.Collection.users,jsonQuery,jsonToUpdate);
    if(jsonResponse.iResult == defines.dbDefines.Code.Error){
        return defines.GenericCodes.DatabaseError;
    }

    if(jsonResponse.iResult == defines.dbDefines.Code.DataUpdated){
        return defines.GenericCodes.Success;
    }

    return defines.GenericCodes.Unknown;
}


module.exports.GetArgument = fpGetArgument;
module.exports.AddProjectDropDown = fpAddProjectDropDown;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.InsertProject = fpInsertProject;
module.exports.DeleteProject = fpDeleteProject;
module.exports.GetHTMLResponse = fpGetHTMLResponse;
module.exports.InsertProject = fpInsertProject;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.ProcessNewUser = fpProcessNewUser;
module.exports.VerifyNewUser = fpVerifyNewUser;