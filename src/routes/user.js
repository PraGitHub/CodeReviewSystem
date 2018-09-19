var express = require('express')
var router = express.router();

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
    var iResult = helper.ProcessNewUser(jsonUserProfile,PassKey);
    console.log('/register :: after processnewuser :: iResult = ',iResult);
    switch(iResult){
        case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Verification mail has been sent to your registered e-mail address. Click the link you get with that e-mail.',
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
                'message':'Sorry! We could not have sent a mail to your registered e-mail address. Please try logging in...',
                'alert':'danger',
                }
            ));
            break;
        }
        case defines.GenericCodes.NeedToChangeUsername:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Sorry! The username you have chosen is not available. Please try again with different username...',
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
    var iResult = helper.VerifyNewUser(strEncryptedUsername,strEncryptedUserdata,PassKey);
    switch(iResult){
        case defines.GenericCodes.Success:{
            httpRes.write(helper.GetHTMLResponse(
                {
                'message':'Congrats! You have been verfied as a user to Code Review System...',
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
                'message':'Sorry! Internal Error. Please try again...',
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

router.get('/password/change',function(httpReq,httpRes){
    /*
    Send a mail containing the following url
        website/user/changepassword/verification/:encusername/:encuserdata
    Also implement a get method for the same url
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});

router.get('/password/verification/:encusername/:encuserdata',function(httpReq,httpRes){
    /*
    Decrypt username and userdata
    If it matches then provide a password change form
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});

router.post('/password/change',function(httpReq,httpRes){
    /*
    Update the password to database
    Provide user an appropriate message and a link to home page to login
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});

module.exports = router;