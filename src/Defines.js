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
    islocked:'islocked'
}

module.exports.dbDefines = dbDefines;
module.exports.userKeys = userKeys;