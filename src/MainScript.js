var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require(__dirname+'/HelperFunctions.js');
var defines = require(__dirname+'/Defines.js')
var httpPort = helper.GetArgument('-port=');
var mailPassword = helper.GetArgument('-password=');

if(httpPort == undefined){
    httpPort = 8085;
}

console.log(httpPort,mailPassword);

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

app.post('/registeruser',function(httpReq,httpRes){
    console.log(httpReq.body);
    var jsonUserProfile = httpReq.body;
    if(typeof(httpReq.body.projectname) == 'string'){
        //console.log('One Project name is chosen')
        jsonUserProfile.projectname = [jsonUserProfile.projectname];
    }
    var iReturnCode = helper.ProcessNewUser(jsonUserProfile);
});