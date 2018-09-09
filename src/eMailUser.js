/*
This is to implement email sender. 
A new user should be sent an e-mail while registering in order to check users' authenticity
look for npm nodemailer
*/
var defines = require(__dirname+'/Defines.js');
var nodemailer = require('nodemailer');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var strEncryptedPassword = '1100cb65afc550b19046ded9fa11f14f343a28';
var deasync = require('deasync');

var Send = function(strPasswordKey,strMailId,strSubject,strMessage){
    var strPassword = cryptr.Decrypt(strEncryptedPassword,strPasswordKey);
    var iResult = undefined;
    let transporter = nodemailer.createTransport({
        service: 'yahoo',
        secure: false,
        port: 25,
        auth: {
            user: 'prashanthhn2509@yahoo.com',
            pass: strPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    let helperOptions = {
        from: 'prashanthhn2509@yahoo.com',
        to: strMailId,
        subject: strSubject,
        html: strMessage
    };
    
    transporter.sendMail(helperOptions, function (err, info) {
        if (err) {
            iResult = defines.mailDefines.Error;
        }
        else {
            iResult = defines.mailDefines.Successful;
            console.log(info);
            //Need to return find a way to determine successful/failure
        }
    });
    while(iResult === undefined)deasync.sleep(1);
    return iResult;
}


//Testing
var key;
var fs = require('fs');
var message = fs.readFileSync(defines.Paths.html+'/Result.html').toString();
var result = Send(key,'prashanthhn2509@gmail.com','CodeReviewSystem',message);
console.log('result = ',result);


module.exports.Send = Send;