process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
process.env.PassKey = '11g@15@231018@!l'
var defines = require(__dirname+'/Defines.js');

process.env.defines = JSON.stringify(defines);

var user = require(defines.Paths.routes+'/user.js');
var project = require(defines.Paths.routes+'/project.js');
var helper = require(defines.Paths.src+'/HelperFunctions.js');

var httpPort = process.env.httpPort = helper.GetArgument('-port=');

if(httpPort == undefined){
    process.env.httpPort = "";
    httpPort = process.env.PORT || 8085;
}

//console.log(httpPort,process.env.PassKey);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(expressSession({secret:'crs.secret'}));
app.use('/user',user);
app.use('/project',project);

app.listen(httpPort,function(err,res){
    if(err) throw err;
    console.log('CodeReviewServer started @ '+httpPort+'....');
});

app.get('/',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(defines.Paths.html+'/Home.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});
