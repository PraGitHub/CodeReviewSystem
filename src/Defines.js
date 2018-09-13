var jsonPaths = {};
var listKeysOfjsonPaths = ['src','html'];

dbDefines = {
    Code:{
        Error:1,
        DataNotFound:2,
        DataFound:3,
        DataAdded:4,
        DataNotAdded:5,
        DataDeleted:6,
        DataUpdated:7,
        DataUpdateNotRequired:8
    },
    Collection:{
        projects:'Projects',
        superusers:'SuperUsers',
        users:'Users'
    }
}

userKeys = {
    username:'username',
    firstname:'firstname',
    lastname:'lastname',
    password:'password',
    key:'key',
    mailid:'mailid',
    projects:'projects',
    numreq:'numrequests',
    numrev:'numreviews',
    numreqinprogress:'numreqinprogress',
    numrevinprogress:'numrevinprogress',
    locked:'locked',
    verified:'verified',
    verificationmailsent:'verificationmailsent'
}

mailDefines = {
    Success:1,
    Failed:2,
    Error:3
}

GenericCodes = {
    Unknown:0,
    InvalidUserData:1,
    ExistingUser:2,
    DatabaseError:3,
    Success:4,
    MailNotSent:5,
    DataMismatch:6,
    UserNotFound:7,
    AlreadyVerified:8,
    ExistingMailId:9
}

function FilljsonPaths(){
    var strParent = __dirname;
    var iIndex = strParent.indexOf('/src');
    if(iIndex < 0){
        iIndex = strParent.indexOf('\\src');
    }
    strParent = strParent.substr(0,iIndex);//this will contain parent or root directory
    jsonPaths['root'] = strParent;
    jsonPaths['parent'] = strParent;
    for(let i in listKeysOfjsonPaths){
        strKey = listKeysOfjsonPaths[i];
        jsonPaths[strKey] = strParent+'/'+strKey;
    }
}

FilljsonPaths();
//console.log(jsonPaths);

module.exports.dbDefines = dbDefines;
module.exports.userKeys = userKeys;
module.exports.mailDefines = mailDefines;
module.exports.Paths = jsonPaths;
module.exports.GenericCodes = GenericCodes;