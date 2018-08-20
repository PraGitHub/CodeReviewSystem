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
    var strHTMLToSend = helper.AddProjectDropDown(__dirname+'/Home.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});

app.get('/register',function(httpReq,httpRes){
    httpRes.sendFile(__dirname+'/Register.html');
});

app.post('/projects/add',function(httpReq,httpRes){
    var bIsSuperuser = helper.IsSuperuser(httpReq.username,httpReq.password);
    if(bIsSuperuser){
        var strMessage = helper.InsertProject(httpReq.projectname);
        httpRes.write(helper.GetHTMLResponse({'message':strMessage,'alert':'success'}));
        httpRes.end();
    }
    else{
        httpRes.write(helper.GetHTMLResponse({'message':'You are not a superuser','alert':'danger'}));
        httpRes.end();
    }
});