var express = require('express')
var router = express.Router();
var defines = JSON.parse(process.env.defines);
var helper = require(defines.Paths.src+'/HelperFunctions.js');

router.get('/register',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(defines.Paths.html+'/Register.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});

router.post('/register',function(httpReq,httpRes){
    console.log(httpReq.body);
    var jsonUserProfile = httpReq.body;
    if(typeof(httpReq.body.projectname) == 'string'){
        //console.log('One Project name is chosen')
        jsonUserProfile.projectname = [jsonUserProfile.projectname];
    }
    var iResult = helper.ProcessNewUser(jsonUserProfile);
    console.log('/register :: after processnewuser :: iResult = ',iResult);
    switch(iResult){
        case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Verification mail has been sent to your registered e-mail address.\nClick the link you get with that e-mail.',
                'alert':'success',
                }
            ));
            break;
        }
        case defines.GenericCodes.InvalidUserData:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Invalid data',
                'alert':'warning',
                }
            ));
            break;
        }
        case defines.GenericCodes.ExistingUser:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry! This username already exists. Please try again...',
                'alert':'info',
                }
            ));
            break;
        }
        case defines.GenericCodes.ExistingMailId:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry! This e-mail id already exists. Please try again...',
                'alert':'info',
                }
            ));
            break;
        }
        case defines.GenericCodes.DatabaseError:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry! Internal Error. Please try again...',
                'alert':'danger',
                }
            ));
            break;
        }
        case defines.GenericCodes.MailNotSent:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry!\nWe could not have sent a mail to your registered e-mail address.\nPlease try logging in...',
                'alert':'danger',
                }
            ));
            break;
        }
        case defines.GenericCodes.NeedToChangeUsername:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry!\nThe username you have chosen is not available.\nPlease try again with different username...',
                'alert':'warning',
                }
            ));
            break;
        }
        case defines.GenericCodes.AlreadyVerified:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'You have already completed verification process...',
                'alert':'info',
                }
            ));
            break;
        }
        default:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Unknown',
                'alert':'primary',
                }
            ));
        }
    }
    httpRes.end();
});

router.get('/verification/:encusername/:encuserdata',function(httpReq,httpRes){
    var strEncryptedUsername = httpReq.params.encusername;
    var strEncryptedUserdata = httpReq.params.encuserdata;
    var iResult = helper.VerifyNewUser(strEncryptedUsername,strEncryptedUserdata);
    switch(iResult){
        case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Congrats!\nYou have been verfied as a user to Code Review System...',
                'alert':'success',
                }
            ));
            break;
        }
        case defines.GenericCodes.DataMismatch:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Data Mismatch',
                'alert':'warning',
                }
            ));
            break;
        }
        case defines.GenericCodes.AlreadyVerified:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'You have already completed verification process...',
                'alert':'info',
                }
            ));
            break;
        }
        case defines.GenericCodes.DatabaseError:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry!\nInternal Error. Please try again...',
                'alert':'danger',
                }
            ));
            break;
        }
        default:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Unknown',
                'alert':'primary',
                }
            ));
        }
    }
    httpRes.end();
});

router.get('/password/change/request',function(httpReq,httpRes){
    /*
    Send GetUserInfo.html to collect user info
    */
   httpRes.sendFile(defines.Paths.html+'/GetUserInfo.html');
});

router.post('/password/change/request',function(httpReq,httpRes){
    /*
    Send a mail containing the following url
        website/user/changepassword/verification/:encusername/:encuserdata
    Also implement a get method for the same url
    */
   var strUsername = httpReq.body.UserName;
   var strMailId = httpReq.body.MailID;
   var iResult = helper.ProcessPasswordChangeRequest(strUsername,strMailId);
   switch(iResult){
       case defines.GenericCodes.UserNotFound:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'User does not exist!',
                    'alert':'danger'
                }
            ));
            break;
       }
       case defines.GenericCodes.MailNotSent:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Hi '+strUsername+'\n'+'We are sorry to say that we could not send passwod change link to your mail address. Please try again...',
                    'alert':'danger'
                }
            ));
            break;
       }
       case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Hi '+strUsername+'\n'+'Password change link has been mailed to you. Please check you registered mailbox...',
                    'alert':'success'
                }
            ));
            break;
       }
       default:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Unknown',
                'alert':'primary',
                }
            ));
       }
   }
   httpRes.end();
});

router.get('/password/verification/:enctime/:encusername/:encuserdata',function(httpReq,httpRes){
    /*
    Decrypt username and userdata
    If it matches then provide a password change form - PasswordChange.html
    */
   var strEncryptedTime = httpReq.params.enctime;
   var bIsRecentRequest = helper.IsRecentRequest(strEncryptedTime);
   if(bIsRecentRequest == false){
        httpRes.write(helper.GetHTMLResponse(
            {
                'message':'Request Timed out !',
                'alert':'danger'
            }
        ));
        httpRes.write(helper.GetHTMLResponse(
            {
                'message':'Please try again...',
                'alert':'warning'
            }
        ,false));
        httpRes.end();
        return;
   }
   var strEncryptedUsername = httpReq.params.encusername;
   var strEncryptedUserdata = httpReq.params.encuserdata;
   var jsonResponse = helper.ProcessUserdata(strEncryptedUsername,strEncryptedUserdata);
   var iResult = jsonResponse.iResult;
   switch(iResult){
       case defines.GenericCodes.UserNotFound:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'User does not exist!',
                    'alert':'danger'
                }
            ));
           break;
       }
       case defines.GenericCodes.DataMismatch:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Data Mismatch',
                'alert':'warning',
                }
            ));
           break;
       }
       case defines.GenericCodes.Success:{
           var strPasswordChangeHTML = helper.GetPasswordChangeHTML(strEncryptedUsername);
           httpRes.write(strPasswordChangeHTML);
           break;
       }
       default:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Unknown',
                'alert':'primary',
                }
            ));
       }
   }
    httpRes.end();
});

router.post('/password/change',function(httpReq,httpRes){
    /*
    Update the password to database
    Provide user an appropriate message and a link to home page to login
    */
   if(httpReq.body.Password != httpReq.body.ConfirmPassword){
       httpRes.write(helper.GetHTMLResponse(
           {
               'message':'Hi '+httpReq.body.UserName+'!\n'+'Password Mismatch...',
               'alert':'danger'
           }
       ));
       httpRes.end();
       return;
   }
   var strUsername = httpReq.body.UserName;
   var strPassword = httpReq.body.Password;
   var iResult = helper.UpdatePassword(strUsername,strPassword);

   switch(iResult){
        case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Hi '+strUsername+' ...'+'\nYour password has beed updated successfully !',
                    'alert':'success'
                }
            ));
            break;
        }
        case defines.GenericCodes.UserNotFound:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'You are not a valid user...',
                    'alert':'warning'
                }
            ));
            break;
        }
        case defines.GenericCodes.DatabaseError:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Sorry '+strUsername+' !\nInternal Error. Please try again...',
                    'alert':'danger'
                }
            ));
            break;
        }
        case defines.GenericCodes.NotRequested:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Hi '+strUsername+'\n You have not requested for password change...',
                    'alert':'warning'
                }
            ));
            break;
        }
        default:{
            httpRes.write(helper.GetHTMLResponse(
                {
                    'message':'Unknown',
                    'alert':'primary'
                }
            ));
        }
   }

   httpRes.end();
});

router.post('/login',function(httpReq,httpRes){
    console.log("/user.js :: /login :: httpReq.body = ",httpReq.body);
    console.log("/user.js :: /login :: httpReq.cookie = ",httpReq.cookie);
    console.log("/user.js :: /login :: httpReq.session = ",httpReq.session);
    console.log("/user.js :: /login :: httpReq.session.user = ",httpReq.session.user);
    var jsonResut = {};
    if(httpReq.session.user == undefined){
        jsonResult = helper.CheckIfUserCanLogin(httpReq.body.Username,httpReq.body.Password);
        if(jsonResut.iResult == defines.GenericCodes.Success){
            httpReq.session.user = httpReq.body.Username;
        }
    }
    else{
        console.log("/user.js :: /login :: httpReq.session.user = ",httpReq.session.user);
        jsonResult = helper.CheckIfUserCanLogin(httpReq.body.Username,httpReq.body.Password,false);
    }
    console.log("/ser.js :: /login :: jsonResult = ",jsonResult);
    httpRes.write(helper.GetHTMLResponse(
        {
            'message':'Not yet implemented ... ',
            'alert':'warning'
        }
    ));
    httpRes.end();
});

module.exports = router;