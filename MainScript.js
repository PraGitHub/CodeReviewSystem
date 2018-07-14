var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require(__dirname+'/HelperFunctions.js');
var httpPort = helper.GetHttpPort();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(httpPort,function(err,res){
    if(err) throw err;
    console.log('CodeReviewServer started....');
});

app.get('/',function(httpReq,httpRes){
    httpRes.sendFile(__dirname+'/Home.html');
});

app.get('/register',function(httpReq,httpRes){
    httpRes.sendFile(__dirname+'/Register.html');
});