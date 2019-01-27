/*
This is to implement email sender. 
A new user should be sent an e-mail while registering in order to check users' authenticity
look for npm nodemailer
*/
var defines = JSON.parse(process.env.defines);
var nodemailer = require('nodemailer');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var strEncryptedPassword = '1100cb65afc550b19046ded9fa11f14f343a28';
var strEncryptedClientId = '6b4c92d00fbf27e03d59979c6485fa63ff4484b3120e1f65111253712bd269f440c82f2091d52364c6c4f096860b6d424c521fe057dc570fb3e2b3cece8b18bc72a1a441b9223bbfa4941a5e745ea57e1bca2e7ba508b56d';
var strEncryptedClientSecret = '5a2ac1b7c06e88f504cd5506767d640fa8b3eca6241c2e4d09cfe2938ff982e4210ac52eb067fcf0';
var strEncryptedRefreshToken = '8fefde1865e4e3a12a4adbf944c3874e86675d2bff994e1037cad46617cc7f7315595ec8386b27ecb499d31178608aa6930605a2118010f4082ebf87e5';
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
            type:'OAuth2',
            user:'crs.codereviewsystem@gmail.com',
            clientId:strClientId,
            clientSecret:strClientSecret,
            refreshToken:strRefreshToken
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