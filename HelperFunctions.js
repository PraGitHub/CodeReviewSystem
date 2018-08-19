var dbHandler = require(__dirname+'/DatabaseHandler.js');

var fpGetHttpPort = function GetHttpPort(){
    var strPort = "";
    for(let i=0;i<process.argv.length;i++){
        var strArg = process.argv[i];
        if(strArg.indexOf('-port:')>-1){
            strPort = strArg.substr(6);
        }
    }
    if(strPort == ""){
        strPort = 8085;
    }
    return strPort;
}

var fpAddProjectDropDown = function AddProjectDropDown(strHTML){
    var strKeyWord = '<!--PROJECTDROPDOWN-->';
    var iPos = strHTML.indexOf(strKeyWord);
    var strPreProjectDropDown = strHTML.substr(0,iPos+strKeyWord.length);
    var strPostProjectDropDown = strHTML.substr(iPos+strKeyWord.length);

}

var fpIsSuperuser = function IsSuperuser(strUsername,strPassword){
    /*
    Check for that username an password in 'SuperUser' collection
    return true or false based on the existence
    */
}

var fpInsertProject = function InsertProject(strProjectName){
    /*
    If exists return a message - Project name exists
    Else Insert and return a message - Successfully added. 
        In case of any error then return that error message
    */
}

var fpGetHTMLResponse = function GetHTMLResponse(JSONInputs = {
    'message':'This function is called without any message',
    'alert':'primary'
}){
    /*
    Compose a html message based on the alert type. Return the string containing that message
    */
}

module.exports.GetHttpPort = fpGetHttpPort;
module.exports.AddProjectDropDown = fpAddProjectDropDown;
module.exports.IsSuperuser = fpIsSuperuser;
module.exports.InsertProject = fpInsertProject;