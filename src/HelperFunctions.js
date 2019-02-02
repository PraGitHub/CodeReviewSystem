var dbHandler = require(__dirname+'/DatabaseHandler.js');
var defines = JSON.parse(process.env.defines);
var cryptr = require(__dirname+'/CryptrWrapper.js');
var email = require(__dirname+'/eMail.js');
var fs = require('fs');
var strArgs = process.argv.toString();

var fpCheckTimeOut = function CheckTimeOut(strTime,strTimeOut){
    var bRetVal = true;
    var iTime = parseInt(strTime);
    var iTimeOut = parseInt(strTimeOut);
    var iCurrentTime = (new Date).getTime();
    if((iCurrentTime - iTime) < iTimeOut){
        bRetVal = false;
    }
    return bRetVal;
}

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

   var strMessage = '';
   var strTempMessage = JSONInputs.message;
    while (true) {
        var iPos = strTempMessage.indexOf('\n');
        var strLine = strTempMessage.substr(0, iPos);
        if (strLine == null || strLine == "") {//EOF
            strMessage = strMessage + '<a>' + strTempMessage + '</a><br/>';
            break;
        }
        strMessage = strMessage + '<a>' + strLine + '</a><br/>';
        strTempMessage = strTempMessage.substr(iPos + 1);
    }

   strToReturn += '<div class="col">';
   strToReturn += '<div class="alert alert-'+JSONInputs.alert+'">';
   strToReturn += '<strong><pre>';
   strToReturn += strMessage;
   strToReturn += '</pre></strong>';
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

var fpCheckIfUserCanLogin = function CheckIfUserCanLogin(strUsername,strPassword,bUsePassword = true){
    var jsonData = {};
    var jsonResult = {};
    jsonResult["iResult"] = defines.GenericCodes.UserNotFound;
    jsonResult["jsonData"] = null;
    jsonData[defines.userKeys.username] = strUsername.toUpperCase();
    if(bUsePassword == true){
        jsonData[defines.userKeys.password] = strPassword;
    }
    var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.users,jsonData);
    //console.log("CheckIfUserInfoExists :: jsonResponseByUsername = ",jsonResponseByUsername,"jsonResponseByMailId = ",jsonResponseByMailId);
    if(jsonResponse.iResult == defines.dbDefines.Code.DataFound){
        if(jsonResponse.arrayjsonResult[0][defines.userKeys.verified] == false){
            jsonResult["iResult"] = defines.GenericCodes.NeedToVerify;
        }
        jsonResult["iResult"] = defines.GenericCodes.Success;
        jsonResult["jsonData"] = jsonResponse.arrayjsonResult[0];
        return jsonResult;
    }
    return jsonResult;
}

var fpCheckIfUserInfoExists = function CheckIfUserInfoExists(strUsername,strMailId){
    var jsonData = {};
    jsonData[defines.userKeys.username] = strUsername.toUpperCase();
    var jsonResponseByUsername = dbHandler.Query(defines.dbDefines.Collection.users,jsonData);
    jsonData = {};
    jsonData[defines.userKeys.mailid] = strMailId.toUpperCase();
    var jsonResponseByMailId = dbHandler.Query(defines.dbDefines.Collection.users,jsonData);
    console.log("CheckIfUserInfoExists :: jsonResponseByUsername = ",jsonResponseByUsername,"jsonResponseByMailId = ",jsonResponseByMailId);
    if(jsonResponseByUsername.iResult == defines.dbDefines.Code.DataFound){
        if(jsonResponseByMailId.iResult == defines.dbDefines.Code.DataFound){
            if(jsonResponseByMailId.arrayjsonResult[0][defines.userKeys.username] == jsonResponseByUsername.arrayjsonResult[0][defines.userKeys.username]){
                if(jsonResponseByMailId.arrayjsonResult[0][defines.userKeys.verified] == false){
                    return [defines.GenericCodes.NeedToVerify,jsonResponseByMailId.arrayjsonResult[0][defines.userKeys.key]];
                }
                else{
                    return [defines.GenericCodes.AlreadyVerified,undefined];
                }
            }
            else{
                return [defines.GenericCodes.ExistingMailId,undefined];
            }
        }
        if(jsonResponseByMailId.iResult == defines.dbDefines.Code.DataNotFound){
            return [defines.GenericCodes.NeedToChangeUsername,undefined];
        }
        return [defines.GenericCodes.DatabaseError,undefined];
    }
    if(jsonResponseByUsername.iResult == defines.dbDefines.Code.DataNotFound){
        if(jsonResponseByMailId.iResult == defines.dbDefines.Code.DataFound){
            return [defines.GenericCodes.ExistingMailId,undefined];
        }
        if(jsonResponseByMailId.iResult == defines.dbDefines.Code.DataNotFound){
            return [defines.GenericCodes.NewUser,undefined];
        }
    }
    return [defines.GenericCodes.DatabaseError,undefined];
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

var fpProcessUserdata = function ProcessUserdata(strEncryptedUsername,strEncryptedData){
    var jsonReturn = {};
    var strPasswordKey = process.env.PassKey;
    jsonReturn['iResult'] = defines.dbDefines.Code.Unknown; //just initialising
    jsonReturn['jsonUserData'] = {};
    var strUsername = cryptr.Decrypt(strEncryptedUsername,strPasswordKey);
    strUsername = strUsername.toUpperCase();
    var jsonQuery = {};
    jsonQuery[defines.userKeys.username] = strUsername;
    var jsonResponse = dbHandler.Query(defines.dbDefines.Collection.users,jsonQuery);
    if(jsonResponse.iResult == defines.dbDefines.Code.DataNotFound){
        jsonReturn.iResult =  defines.GenericCodes.UserNotFound;
        return jsonReturn;
    }

    var jsonUserProfile = jsonResponse.arrayjsonResult[0];
    var strUserdata = cryptr.Decrypt(strEncryptedData,jsonUserProfile[defines.userKeys.key]);
    var jsonUserdata = JSON.parse(strUserdata);

    for(let key in jsonUserdata){
        if(jsonUserdata[key] != jsonUserProfile[key]){
            jsonReturn.iResult = defines.GenericCodes.DataMismatch;
            return jsonReturn;
        }
    }
    jsonReturn.jsonUserdata = jsonUserProfile;
    jsonReturn.iResult = defines.GenericCodes.Success;
    return jsonReturn;
}

var fpProcessNewUser = function ProcessNewUser(jsonProfile){
    var jsonProfileToDB = {};
    var strPasswordKey = process.env.PassKey;
    var arrayExceptionMailId = ['prashanthhn2509@gmail.com'];

    if(jsonProfile == undefined){
        return defines.GenericCodes.InvalidUserData;
    }

    if(fpIsAnyKeyUndefined(jsonProfile) == false){
        return defines.GenericCodes.InvalidUserData;
    }

    var [iResult,strKey] = fpCheckIfUserInfoExists(jsonProfile['UserName'],jsonProfile['MailID']);

    console.log('ProessNewUser :: iResult = ',iResult);
    
   if(iResult != defines.GenericCodes.NewUser && iResult != defines.GenericCodes.NeedToVerify){
       if(iResult == defines.GenericCodes.ExistingMailId){
            for(let i in arrayExceptionMailId){
                if(jsonProfile['MailID'].toUpperCase() != arrayExceptionMailId[i].toUpperCase()){
                    return iResult;
                }
            }
            iResult = defines.GenericCodes.NewUser;
       }
       else{
           return iResult;
       }
   }

    if(iResult == defines.GenericCodes.NewUser){
        jsonProfileToDB[defines.userKeys.username] = jsonProfile['UserName'].toUpperCase();
        jsonProfileToDB[defines.userKeys.firstname] = jsonProfile['FirstName'].toUpperCase();
        jsonProfileToDB[defines.userKeys.lastname] = jsonProfile['LastName'].toUpperCase();
        jsonProfileToDB[defines.userKeys.mailid] = jsonProfile['MailID'].toUpperCase();
        jsonProfileToDB[defines.userKeys.password] = jsonProfile['Password'];
        jsonProfileToDB[defines.userKeys.projects] = jsonProfile['projectname'];
        jsonProfileToDB[defines.userKeys.verified] = false;
        jsonProfileToDB[defines.userKeys.verificationmailsent] = false;
        jsonProfileToDB[defines.userKeys.key] = cryptr.GetKey([jsonProfileToDB[defines.userKeys.username],
                                                            jsonProfileToDB[defines.userKeys.firstname],
                                                            jsonProfileToDB[defines.userKeys.lastname]]);
        var jsonResponseDB = dbHandler.Insert(defines.dbDefines.Collection.users,jsonProfileToDB);
        if(jsonResponseDB.iResult != defines.dbDefines.Code.DataAdded){
            return defines.GenericCodes.DatabaseError;
        }
        strKey = jsonProfileToDB[defines.userKeys.key];
    }

    if(iResult == defines.GenericCodes.NewUser || iResult == defines.GenericCodes.NeedToVerify){
        var strMessage = '';
        var strURL = defines.server.protocol+'://'+defines.server.host+'/user/verification/';
        var jsonTemp = {};
        jsonTemp[defines.userKeys.username] = jsonProfile['UserName'].toUpperCase();
        jsonTemp[defines.userKeys.password] = jsonProfile['Password'];
        jsonTemp[defines.userKeys.firstname] = jsonProfile['FirstName'].toUpperCase();
        jsonTemp[defines.userKeys.lastname] = jsonProfile['LastName'].toUpperCase();
        var strUserData = JSON.stringify(jsonTemp);
        var strEncryptedData = cryptr.Encrypt(strUserData,strKey);
        var strEncryptedUsername = cryptr.Encrypt(jsonProfile['UserName'].toUpperCase(),strPasswordKey);
        strURL += strEncryptedUsername;
        strURL += '/';
        strURL += strEncryptedData;
        strMessage += '<p>Please Click the below link to activate your account</p>';
        strMessage += '<br>';
        strMessage += '<a href="'+strURL+'">'+strURL+'</a><br>'

        var jsonResponseMail = email.Send(strPasswordKey,jsonProfile['MailID'],'Verification Mail',strMessage);
        if(jsonResponseMail.iResult != defines.mailDefines.Success){
            return defines.GenericCodes.MailNotSent;
        }
        var jsonToUpdate = {};
        var jsonQuery = {};
        jsonQuery[defines.userKeys.username] = jsonProfile['UserName'].toUpperCase();
        jsonToUpdate[defines.userKeys.verificationmailsent] = true;
        jsonResponseDB = dbHandler.Update(defines.dbDefines.Collection.users,jsonQuery,jsonToUpdate);
        if(jsonResponseDB.iResult != defines.dbDefines.Code.DataUpdated){
            return defines.GenericCodes.DatabaseError;
        }
        return defines.GenericCodes.Success;
    }
    return defines.GenericCodes.Unknown;
}

var fpVerifyNewUser = function VerifyNewUser(strEncrypterUsername,strEncryptedUserdata){
    var strPasswordKey = process.env.PassKey;
    var jsonResponse = fpProcessUserdata(strEncrypterUsername,strEncryptedUserdata,strPasswordKey);
    if(jsonResponse.iResult != defines.GenericCodes.Success){
        return jsonResponse.iResult;
    }
    
    var jsonUserProfile = jsonResponse.jsonUserdata;

    if(jsonUserProfile[defines.userKeys.verified] == true){
        return defines.GenericCodes.AlreadyVerified;
    }

    var jsonToUpdate = {};
    jsonToUpdate[defines.userKeys.verified] = true;
    jsonResponse = dbHandler.Update(defines.dbDefines.Collection.users,jsonUserProfile,jsonToUpdate);
    if(jsonResponse.iResult == defines.dbDefines.Code.Error){
        return defines.GenericCodes.DatabaseError;
    }

    if(jsonResponse.iResult == defines.dbDefines.Code.DataUpdated){
        return defines.GenericCodes.Success;
    }

    return defines.GenericCodes.Unknown;
}

var fpProcessPasswordChangeRequest = function ProcessPasswordChangeRequest(strUsername,strMailId){
   var jsonQuery = {};
   strPasswordKey = process.env.PassKey;
   strUsername = strUsername.toUpperCase();
   strMailId = strMailId.toUpperCase();
   jsonQuery[defines.userKeys.username] = strUsername;
   jsonQuery[defines.userKeys.mailid] = strMailId;
   var jsonResult = dbHandler.Query(defines.dbDefines.Collection.users,jsonQuery);
   if(jsonResult.iResult == defines.dbDefines.Code.DataNotFound){
       return defines.GenericCodes.UserNotFound;
   }
   var jsonUserData = jsonResult.arrayjsonResult[0];
   console.log("ProcessPasswordChangeRequest :: jsonResult = ",jsonResult);
   var strUserKey = jsonUserData[defines.userKeys.key];
   var strPassword = jsonUserData[defines.userKeys.password];

   var jsonDataToEncrypt = {};
   jsonDataToEncrypt[defines.userKeys.username] = strUsername;
   jsonDataToEncrypt[defines.userKeys.mailid] = strMailId;
   jsonDataToEncrypt[defines.userKeys.password] = strPassword;
   var strDataToEncrypt = JSON.stringify(jsonDataToEncrypt);
   var strEncryptedUsername = cryptr.Encrypt(strUsername,strPasswordKey);
   var strEncryptedData = cryptr.Encrypt(strDataToEncrypt,strUserKey);
   var strTime = ((new Date).getTime()).toString();
   var strEncrptedTime = cryptr.Encrypt(strTime,strPasswordKey);

   var strURL = defines.server.protocol+'://'+defines.server.host+'/user/password/verification/'+strEncrptedTime+'/'+strEncryptedUsername+'/'+strEncryptedData;
   var strMessage = 'Click this link to proceed with password change process... '+strURL;
   var jsonResponseMail = email.Send(strPasswordKey,strMailId,'Password change request',strMessage);
   if(jsonResponseMail.iResult != defines.mailDefines.Success){
    return defines.GenericCodes.MailNotSent;
   }

   var jsonToDB = {};
   jsonToDB[defines.userKeys.passwordchangerequested] = true;
   var jsonDBResponse = dbHandler.Update(defines.dbDefines.Collection.users,jsonQuery,jsonToDB);
   if(jsonDBResponse.iResult == defines.dbDefines.Code.Error){
       return defines.GenericCodes.DatabaseError;
   }
   if(jsonDBResponse.iResult == defines.dbDefines.Code.DataNotFound){
       return defines.GenericCodes.UserNotFound;
   }

   return defines.GenericCodes.Success;
}

var fpIsRecentRequest = function IsRecentRequest(strEncryptedTime){
    var bRetVal = true;
    var strPasswordKey = process.env.PassKey;
    var strRequesteCreationTime = cryptr.Decrypt(strEncryptedTime,strPasswordKey);
    var bTimeOut = fpCheckTimeOut(strRequesteCreationTime,defines.TimeOutTime);
    if(bTimeOut == true){
        bRetVal = false;
    }
    return bRetVal;
}

var fpGetPasswordChangeHTML = function GetPasswordChangeHTML(strEncryptedUsername){
    var strUsername = cryptr.Decrypt(strEncryptedUsername,process.env.PassKey);
    var strHTMLConetentToWrite = '<input class="form-control" type="text" name="UserName" value="'+strUsername+'" pattern="[A-z a-z]{8,}" title="Minimium of 8 letters of upper/lower/mixed cases" readonly></input>';
    var strKeyWord = '<!--USERNAME-->'
    var strHTML = fs.readFileSync(defines.Paths.html+'/PasswordChange.html').toString();
    var iPos = strHTML.indexOf(strKeyWord);
    var strPreUsername = strHTML.substr(0,iPos+strKeyWord.length);
    var strPostUsername = strHTML.substr(iPos+strKeyWord.length);
    var strPasswordChangeHTML = strPreUsername + strHTMLConetentToWrite + strPostUsername;
    return strPasswordChangeHTML;
}

var fpUpdatePassword = function UpdatePassword(strUsername,strPassword){
    var strPasswordKey = process.env.PassKey;
    var jsonQuery = {};
    jsonQuery[defines.userKeys.username] = strUsername.toUpperCase();
    var jsonDBResponse = dbHandler.Query(defines.dbDefines.Collection.users,jsonQuery);
    if(jsonDBResponse.iResult == defines.dbDefines.Code.Error){
        return defines.GenericCodes.DatabaseError;
    }
    if(jsonDBResponse.iResult == defines.dbDefines.Code.DataNotFound){
        return defines.GenericCodes.UserNotFound;
    }
    var jsonUserProfile = jsonDBResponse.arrayjsonResult[0];
    if(jsonUserProfile[defines.userKeys.passwordchangerequested] == false){
        return defines.GenericCodes.NotRequested;
    }
    var jsonToDB = {};
    jsonToDB[defines.userKeys.password] = strPassword;
    jsonToDB[defines.userKeys.passwordchangerequested] = false;
    jsonDBResponse = dbHandler.Update(defines.dbDefines.Collection.users,jsonQuery,jsonToDB);

    if(jsonDBResponse.iResult == defines.dbDefines.Code.Error){
        return defines.GenericCodes.DatabaseError;
    }

    return defines.GenericCodes.Success;
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
module.exports.ProcessPasswordChangeRequest = fpProcessPasswordChangeRequest;
module.exports.UpdatePassword = fpUpdatePassword;
module.exports.ProcessUserdata = fpProcessUserdata;
module.exports.IsRecentRequest = fpIsRecentRequest;
module.exports.CheckTimeOut = fpCheckTimeOut;
module.exports.GetPasswordChangeHTML = fpGetPasswordChangeHTML;
module.exports.CheckIfUserCanLogin = fpCheckIfUserCanLogin;