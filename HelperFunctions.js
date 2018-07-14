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

module.exports.GetHttpPort = fpGetHttpPort;