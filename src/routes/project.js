var express = require('express')
var router = express.router();
var defines = process.env.defines;
var helper = require(defines.Paths.src+'/HelperFunctions.js');

router.post('/add',function(httpReq,httpRes){
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

router.post('/delete',function(httpReq,httpRes){
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

module.exports = router;