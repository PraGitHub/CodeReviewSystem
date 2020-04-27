/*
This is to implement email sender. 
A new user should be sent an e-mail while registering in order to check users' authenticity
look for npm nodemailer
*/
var defines = JSON.parse(process.env.defines);
var nodemailer = require('nodemailer');
var cryptr = require(__dirname+'/CryptrWrapper.js');
var strEncryptedClientId = 'a43a6cf26f847dcefe8561adea12da87a2f523bbe5cb0d5f551df43cdfca55fe6eaadbec061ebffa31f11f0a7df0d67334ba0bbe4e47b2ef98cde18cbb6dc10ec0d6182d9e62e37a9f54713c4b2549620aee970cb36a3047139e53c88d683bb7e656eb50fe0c5770dcf0a55942b564cebdf28c8f3a8eeb10af7965d8226a10584892801ddf5590dad96099944242016fa5c5b157049670757318c5a7ecfe56648565d27234ae8650';
var strEncryptedClientSecret = 'a5108b7f848ef2e647d65bf28234acbbb5d7fb945a5fbb8b75857bfe98477aafd9fb1aee9940a176457d6f471416ca877bf13a96334521db9e0f5a6d3238d7abed0bff8c84f05db9bb33470b4f2fc8b731fbdbf324efdb73d838aff2eeb7b0a0899a258d70208ef62f922997b4cbf592a130b474ba618ed9';
var strEncryptedRefreshToken = 'c9ceb3ccf3217670ef95fe0d9bfbf4ba8502cafd63d7ee6f18d3746ff941c6e6e0e7d1ddbbe6ca41c65bcb7917c5037d907818e93f26adfc3d12eb28f39cf9e2c4d4b6c53b991dd5c1f140f765718f1bfd6ae541c4b037005724ff1df4b9401fc15e782e8c29a592e48b603114e47bb71733b525ac3ebd8149070684b405052047fc02df0c4ce9fab0da644228';
var deasync = require('deasync');

var Send = function(strPasswordKey,strMailId,strSubject,strMessage){
    var strClientId = cryptr.Decrypt(strEncryptedClientId,strPasswordKey);
    var strClientSecret = cryptr.Decrypt(strEncryptedClientSecret,strPasswordKey);
    var strRefreshToken = cryptr.Decrypt(strEncryptedRefreshToken,strPasswordKey);
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