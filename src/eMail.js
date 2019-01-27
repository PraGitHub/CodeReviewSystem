/*
This is to implement email sender. 
A new user should be sent an e-mail while registering in order to check users' authenticity
look for npm nodemailer
*/
var defines = JSON.parse(process.env.defines);
var nodemailer = require('nodemailer');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var strEncryptedPassword = '1100cb65afc550b19046ded9fa11f14f343a28';
var deasync = require('deasync');

var Send = function(strPasswordKey,strMailId,strSubject,strMessage){
    var strPassword = cryptr.Decrypt(strEncryptedPassword,strPasswordKey);
    strPassword = String(strPassword);
    console.log('eMail :: strPassword = ',strPassword)
    var jsonReturn = {}
    jsonReturn['iResult'] = undefined;
    jsonReturn['response'] = undefined;
    console.log('strMessage = ',strMessage);
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        service: 'Gmail',
        secure: false,
        port: 25,
        auth: {
            user: 'crs.codereviewsystem@gmail.com',
            pass: strPassword
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