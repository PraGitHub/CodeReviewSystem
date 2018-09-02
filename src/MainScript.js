var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require(__dirname+'/HelperFunctions.js');
var httpPort = helper.GetHttpPort();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(httpPort,function(err,res){
    if(err) throw err;
    console.log('CodeReviewServer started @ '+httpPort+'....');
});

app.get('/',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(helper.jsonPaths.html+'/Home.html');
    httpRes.write(strHTMLToSend);
    httpRes.end();
});

app.get('/register',function(httpReq,httpRes){
    var strHTMLToSend = helper.AddProjectDropDown(helper.jsonPaths.html+'/Register.html');
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
           var strHtmlResponse = helper.DeleteProject(httpReq.body.projectname)
           httpRes.write(strHtmlResponse);
           httpRes.end();
        }
        else{
            httpRes.write(helper.GetHTMLResponse({'message':'You are not a super user to delete a project','alert':'danger'}));
            httpRes.end();
        }
    }
});
