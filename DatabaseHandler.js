var dbURL = "mongodb://localhost:27017/";
var mongoClient = require('mongodb').MongoClient;
var deasync = require('deasync');
var defines = require(__dirname+'/Defines.js');
//var CollectionList = ['Projects','Users','SuperUser'];
var JSONCollection = {};
mongoClient.connect(dbURL, {useNewUrlParser:true},function (err, db) {
    if (err) throw err;
    console.log("DB Strated...");
    dbObject = db.db("CodeReviewSystem");
    for(let i in defines.dbDefines.Collection){
        var strCollectionName = defines.dbDefines.Collection[i];
        dbObject.createCollection(strCollectionName, function (err, res) {
            if (err) throw err;
            console.log(res.s.name,"Collection Created...")
        });
        JSONCollection[strCollectionName] = dbObject.collection(strCollectionName);
    }
    //console.log('JSONCollection :: ',JSONCollection);
});

var fpInsert = function Insert(strCollectionName,JSONData){
    var dbCollection = JSONCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['jsonResponse'] = undefined;
    dbCollection.insertOne(JSONData,function(err,result){
        if(err){
            jsonReturn.iResult = defines.dbDefines.Code.Error;
        }
        else{
            jsonReturn.jsonResponse = result.result;
            if(result != null || result != undefined){
                jsonReturn.iResult = defines.dbDefines.Code.DataAdded;
            }
            else{
                jsonReturn.iResult = defines.dbDefines.Code.DataNotAdded;
            }
        }
    });
    while(jsonReturn.iResult === undefined || jsonReturn.jsonResponse === undefined) deasync.sleep(1);
    //console.log(jsonReturn);
    return jsonReturn;
}

var fpQuery = function Query(strCollectionName,JSONQuery,iLimit = 1){
    var dbCollection = JSONCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['arrayjsonResult'] = undefined;
    console.log('Query :: ',iLimit);
    dbCollection.find(JSONQuery).limit(iLimit).toArray(function(err,result){
        if(err){
            jsonReturn.iResult = defines.dbDefines.Code.Error;
        }
        else{
            jsonReturn.arrayjsonResult = result;
            if(result != null || result != undefined){
                jsonReturn.iResult = defines.dbDefines.Code.DataFound;
            }
            else{
                jsonReturn.iResult = defines.dbDefines.Code.DataNotFound;
            }
        }
    });
    while(jsonReturn.iResult === undefined || jsonReturn.arrayjsonResult === undefined) deasync.sleep(1);
    //console.log(jsonReturn);
    return jsonReturn;
}


//deasync.sleep(5000);
/*
ret = fpInsert('Projects',{title:'ProjectHou'});
console.log("insert returned :",ret);
ret = fpQuery('Projects',{title:'ProjectHoun'});
console.log('query returned :',ret);
ret = fpQuery('Projects',{},0);
console.log('query returned : ',ret);
*/

module.exports.Insert = fpInsert;
module.exports.Query = fpQuery;
