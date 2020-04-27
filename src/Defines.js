var cryptr = require(__dirname+'/CryptrWrapper.js');
var jsonPaths = {};
var jsonPathKeys = {
    'src':{
        0:'src',
        1:['routes']
    },
    'html':{
        0:'html',
        1:undefined
    }
}

server = {
    "host":"codereviewsystem.herokuapp.com",
    "protocol":"https",
    "dbURL":"mongodb://codereviewsystem:<password>@ds257054.mlab.com:57054/codereviewsystem"
}

dbDefines = {
    "dbname":"codereviewsystem",
    Code:{
        Error:1,
        DataNotFound:2,
        DataFound:3,
        DataAdded:4,
        DataNotAdded:5,
        DataDeleted:6,
        DataUpdated:7,
        DataUpdateNotRequired:8,
        Unknown:9
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
    verificationmailsent:'verificationmailsent',
    passwordchangerequested:'passwordchangerequested'
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
    ExistingMailId:9,
    NeedToVerify:10,
    NeedToChangeUsername:11,
    NewUser:12
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
    for(let i in jsonPathKeys){
        strKey1 = jsonPathKeys[i][0];
        jsonPaths[strKey1] = strParent+'/'+strKey1;
        if(jsonPathKeys[i][1] != undefined){
            for(let k in jsonPathKeys[i][1]){
                strKey2 = jsonPathKeys[i][1][k]
                jsonPaths[strKey2] = strParent+'/'+strKey1+'/'+strKey2;
            }
        }
    }
}

function FrameDBURL(){
    var strdbURL = server.dbURL;
    var strEncryptedPassword = '1235180af0557e26e3a4257ac91bd58eccc99f1cff5a42742cb11b5f0c885dcab407e286f81fa82367ffddcfdc862d157aefb1246c55c31d3854aed690614fe992fe4e439b91d88afc9ca5d9ae1dd9bc63290df75153de8587306369ce79c44710c85e6adb495be8d37936';/*'315b9f432b8e88d4129612017af5c9e4b6c6cd011af410887d9f81';*/
    var strPasskey = process.env.PassKey;
    var strPassword = cryptr.Decrypt(strEncryptedPassword,strPasskey);
    console.log('defines :: FrameDBURL :: strPassword = ',strPassword)
    strdbURL = strdbURL.replace('<password>',strPassword);
    server.dbURL = strdbURL;
    //console.log('Defines :: server = ',server);
}

FilljsonPaths();
FrameDBURL();
//console.log(jsonPaths);

module.exports.dbDefines = dbDefines;
module.exports.userKeys = userKeys;
module.exports.mailDefines = mailDefines;
module.exports.Paths = jsonPaths;
module.exports.GenericCodes = GenericCodes;
module.exports.TimeOutTime = '300000';// 5*60*1000 ms => 5 mins
module.exports.server = server;
