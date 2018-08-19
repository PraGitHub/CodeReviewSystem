var dbURL = "mongodb://localhost:27017/";
var mongoClient = require('mongodb').MongoClient;
var CollectionList = ['Projects','Users','SuperUser'];
var JSONCollection = {};
mongoClient.connect(dbURL, function (err, db) {
    if (err) throw err;
    console.log("DB Strated...");
    dbObject = db.db("CodeReviewSystem");
    for(let i in CollectionList){
        var strCollectionName = CollectionList[i];
        dbObject.createCollection(strCollectionName, function (err, res) {
            if (err) throw err;
            console.log(res.s.name,"Collection Created...")
        });
        JSONCollection[strCollectionName] = dbObject.collection(strCollectionName);
    }
    console.log('JSONCollection :: ',JSONCollection);
});

var fpInsert = function Insert(dbCollection,JSONData){
    var bRetval = true;
    dbCollection.insertOne(JSONData,function(err,res){
        if(err){
            bRetval = false;
        }
    });
    return bRetval;
}

module.exports.Insert = fpInsert;
