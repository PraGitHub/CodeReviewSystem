/*
This is to implement email sender. 
A new user should be sent an e-mail while registering in order to check users' authenticity
look for npm nodemailer
*/
var defines = JSON.parse(process.env.defines);
var nodemailer = require('nodemailer');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var strEncryptedPassword = '1100cb65afc550b19046ded9fa11f14f343a28';
var strEncryptedClientId = '82178ffc576da6a3770674aa160dfed75f2db171c53567a4e0784c39e508730e39e3393ff04caeac2a2a3417bd1103f3fe76f61f746976ef986b3df472612d7aaaff6ed90a26b2201a5eeedf0599f9aa83d4733a41c31988';
var strEncryptedClientSecret = '399848ec979b253520c57a94f71ff0cde96039320b20646ce5f5b56d051386b702a0fb683d597476';
var strEncryptedRefreshToken;
var deasync = require('deasync');

var Send = function(strPasswordKey,strMailId,strSubject,strMessage){
    var strPassword = cryptr.Decrypt(strEncryptedPassword,strPasswordKey);
    var strClientId = cryptr.Decrypt(strEncryptedClientId,strPasswordKey);
    var strClientSecret = cryptr.Decrypt(strEncryptedClientSecret,strPasswordKey);
    var strRefreshToken = cryptr.Decrypt(strEncryptedRefreshToken,strPasswordKey);
    strPassword = String(strPassword);
    console.log('eMail :: strPassword = ',strPassword)
    var jsonReturn = {}
    jsonReturn['iResult'] = undefined;
    jsonReturn['response'] = undefined;
    console.log('strMessage = ',strMessage);
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
            //type:'OAuth2',
            user:'crs.codereviewsystem@gmail.com',
            pass:strPassword
            //clientId:strClientId,
            //clientSecret:strClientSecret,
            //refreshToken:''
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    let helperOptions = {
        from: 'crs.codereviewsystem@gmail.com',
        to: strMailId,
        subject: strSubject,
        html: strMessage
    };
    
    transporter.sendMail(helperOptions, function (err, info) {
        console.log('eMail :: info = ',info," err = ",err);
        if (err || info == undefined) {
            jsonReturn.iResult = defines.mailDefines.Error;
            jsonReturn.response = '';
        }
        else {
            jsonReturn.response = info.response;
            jsonReturn.iResult = defines.mailDefines.Success;
            //Need to return find a way to determine successful/failure
        }
        console.log('eMail :: jsonReturn = ',jsonReturn);
    });
    while(jsonReturn.iResult === undefined || jsonReturn.response === undefined)deasync.sleep(1);
    return jsonReturn;
}


//Testing
//var key ;
//var fs = require('fs');
//var message = fs.readFileSync(defines.Paths.html+'/Result.html').toString();
//console.log(message);
//var result = Send(key,'prashanthhn2509@gmail.com','CodeReviewSystem',message);
//var result = Send(key,'prashanth.hn@efi.com','CodeReviewSystem',message);
//var result = Send(key,'prashanthhn2509@gmail.com','CodeReviewSystem','<html><body><h2>TestMail</h2><p>This is message1</p><p>This is message2</p></body></html>');
//console.log('result = ',result);

module.exports.Send = Send;