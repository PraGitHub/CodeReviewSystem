var dbURL = "mongodb://localhost:27017/";
var mongoClient = require('mongodb').MongoClient;
var deasync = require('deasync');
var defines = require(__dirname+'/Defines.js');
//var CollectionList = ['Projects','Users','SuperUser'];
var jsonCollection = {};
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
        jsonCollection[strCollectionName] = dbObject.collection(strCollectionName);
    }
    //console.log('jsonCollection :: ',jsonCollection);
});

var fpInsert = function Insert(strCollectionName,jsonData){
    var dbCollection = jsonCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['jsonResponse'] = undefined;
    dbCollection.insertOne(jsonData,function(err,result){
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

var fpQuery = function Query(strCollectionName,jsonQuery,iLimit = 1){
    var dbCollection = jsonCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['arrayjsonResult'] = undefined;
    //console.log('Query :: ',jsonQuery,iLimit);
    dbCollection.find(jsonQuery).limit(iLimit).toArray(function(err,result){
        if(err){
            jsonReturn.iResult = defines.dbDefines.Code.Error;
        }
        else{
            jsonReturn.arrayjsonResult = result;
            //console.log('Query :: result = ',result);
            if(result.length > 0){
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

var fpDelete = function Delete(strCollectionName,jsonData){
    var dbCollection = jsonCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['jsonResponse'] = undefined;
    dbCollection.deleteOne(jsonData,function(err,result){
        jsonReturn.jsonResponse = result.result;
        if(err){
            jsonReturn.iResult = defines.dbDefines.Code.Error;
        }
        else{
            //console.log('Delete :: callback result = ',result);
            if(result.deletedCount == 0){
                jsonReturn.iResult = defines.dbDefines.Code.DataNotFound;
            }
            else{
                jsonReturn.iResult = defines.dbDefines.Code.DataDeleted;
            }
        }
    });
    while(jsonReturn.iResult === undefined || jsonReturn.jsonResponse === undefined) deasync.sleep(1);
    return jsonReturn;
}

var fpUpdate = function Update(strCollectionName,jsonQuery,jsonData){
    var dbCollection = jsonCollection[strCollectionName];
    var jsonReturn = {};
    jsonReturn['iResult'] = undefined;
    jsonReturn['jsonResponse'] = undefined;
    dbCollection.updateOne(jsonQuery,{$set:jsonData},function(err,result){
        //Need to complete this
        jsonReturn.jsonResponse = result.result;
        if(err){
            jsonReturn.iResult = defines.dbDefines.Code.Error;
        }
        else{
            if(result.result.n>0){
                if(result.result.nModified>0){
                    jsonReturn.iResult = defines.dbDefines.Code.DataUpdated;
                }
                else{
                    jsonReturn.iResult = defines.dbDefines.Code.DataUpdateNotRequired;
                }
            }
            else{
                jsonReturn.iResult = defines.dbDefines.Code.DataNotFound;
            }
        }
    });
    while(jsonReturn.iResult === undefined || jsonReturn.jsonResponse === undefined) deasync.sleep(1);
    return jsonReturn;
}


deasync.sleep(5000);
/*
ret = fpInsert('Projects',{title:'ProjectHou'});
console.log("insert returned :",ret);
ret = fpQuery('Projects',{title:'ProjectHoun'});
console.log('query returned :',ret);
ret = fpQuery('Projects',{},0);
console.log('query returned : ',ret);
ret = fpDelete(defines.dbDefines.Collection.projects,{title:'nothing'});
console.log('ret = ',ret);
ret = fpUpdate(defines.dbDefines.Collection.superusers,{username:('prashanh').toUpperCase()},{password:'password123',mailid:'prashanthhn2509@.com',projects:['project1','project23']});
console.log('ret = ',ret);
*/

module.exports.Insert = fpInsert;
module.exports.Query = fpQuery;
module.exports.Delete = fpDelete;
module.exports.Update = fpUpdate;
