var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require(__dirname+'/HelperFunctions.js');
var defines = require(__dirname+'/Defines.js')
var httpPort = helper.GetArgument('-port=');
var PassKey = helper.GetArgument('-passkey=');

if(httpPort == undefined){
    httpPort = 8085;
}

console.log(httpPort,PassKey);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(httpPort,function(err,res){
    if(err) throw err;
    console.log('CodeReviewServer started @ '+httpPort+'....');
});

app.get('/',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(defines.Paths.html+'/Home.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});

app.get('/register',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(defines.Paths.html+'/Register.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});

app.post('/project/add',function(httpReq,httpRes){
    var bIsSuperuser = helper.IsSuperuser(httpReq.body.username,httpReq.body.password);
    if(bIsSuperuser){
        //Modify InsertProject in such a way that it should return html response
        var strHtmlResponse = helper.InsertProject(httpReq.body.projectname,httpReq.body.username);
        httpRes.write(strHtmlResponse);
        httpRes.end();
    }
    else{
        httpRes.write(helper.GetHTMLResponse({'message':'You are not a superuser','alert':'danger'}));
        httpRes.end();
    }
});

app.post('/project/delete',function(httpReq,httpRes){
    console.log('/project/delete :: ',httpReq.body.projectname);
    if(httpReq.body.projectname ==  '#NOTHING#'){
        httpRes.write(helper.GetHTMLResponse({'message':'No project has been selected to delete','alert':'info'}));
        httpRes.end();
    }
    else{
        var bIsSuperuser = helper.IsSuperuser(httpReq.body.username,httpReq.body.password);
        if(bIsSuperuser){
           var arrayProjects;
           if(typeof(httpReq.body.projectname) == 'string'){
               arrayProjects = [httpReq.body.projectname];
           }
           else{
               arrayProjects = httpReq.body.projectname;
           }
           var strHtmlResponse = helper.DeleteProject(arrayProjects)
           httpRes.write(strHtmlResponse);
           httpRes.end();
        }
        else{
            httpRes.write(helper.GetHTMLResponse({'message':'You are not a super user to delete a project','alert':'danger'}));
            httpRes.end();
        }
    }
});

app.post('/user/register',function(httpReq,httpRes){
    console.log(httpReq.body);
    var jsonUserProfile = httpReq.body;
    if(typeof(httpReq.body.projectname) == 'string'){
        //console.log('One Project name is chosen')
        jsonUserProfile.projectname = [jsonUserProfile.projectname];
    }
    var iResult = helper.ProcessNewUser(jsonUserProfile,PassKey);
    console.log('/user/register :: after processnewuser :: iResult = ',iResult);
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

app.get('/user/verification/:encusername/:encuserdata',function(httpReq,httpRes){
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

app.get('/user/password/change',function(httpReq,httpRes){
    /*
    Send a mail containing the following url
        website/user/changepassword/verification/:encusername/:encuserdata
    Also implement a get method for the same url
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});

app.get('/user/password/verification/:encusername/:encuserdata',function(httpReq,httpRes){
    /*
    Decrypt username and userdata
    If it matches then provide a password change form
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});

app.post('/user/password/change',function(httpReq,httpRes){
    /*
    Update the password to database
    Provide user an appropriate message and a link to home page to login
    */
   httpRes.write(helper.GetHTMLResponse({'message':'Yet to implement...','alert':'warning'}));
   httpRes.end();
});