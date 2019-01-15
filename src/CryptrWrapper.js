/*
This should be a wrapper for 'cryptr'.
Customised according to our requirement
look for npm encryptr
*/

cryptr = require('cryptr');

var GetCryptr = function(strKey){
    CryptrObj = new cryptr(strKey);
    return CryptrObj;
}

var GetKey = function(listOfStrings){
    /*
        Need write our own logic to generate a key based on the strings in the list and current time
    */
   var strTime = new Date().getTime().toString();
   var listKeyOfEachStrings = [];
   for(let i in listOfStrings){
       listKeyOfEachStrings[i] = Encrypt(listOfStrings[i],strTime);
   }
   var strMasterData = listKeyOfEachStrings.join(strTime);
   var strMasterKey = Encrypt(strMasterData,strTime);
   //console.log('GetKey :: strMasterKey = ',strMasterKey);
   return strMasterKey;
}

var Encrypt = function(strData,strKey){
    CryptrObj = GetCryptr(strKey);
    var strEncryptedData = CryptrObj.encrypt(strData);
    //console.log('Encrypt :: strEncryptedData = ',strEncryptedData);
    return strEncryptedData;
}

var Decrypt = function(strData,strKey){
    CryptrObj = GetCryptr(strKey);
    var strDecryptedData = CryptrObj.decrypt(strData);
    //console.log('Decrypt :: strDecryptedData = ',strDecryptedData);
    return strDecryptedData;
}

//Testing

/*
var jsonTemp = {};
jsonTemp['key1'] = 'prashanth';
jsonTemp['key2'] = ['a',34,'123',{'12':'23'}];
console.log('jsonTemp = ',jsonTemp);
var strData = JSON.stringify(jsonTemp);
var strKey = GetKey(['prashanh','Prashanth','H N']);
var encryptedData = Encrypt(strData,strKey);
var decryptedData = Decrypt(encryptedData,strKey);
decryptedData = Decrypt('361c4e67f3e612d45dfe917853b5bdebce74096ff6c3a65f47cfb1f5d935d8e57c4aa6d1d5e5846faa463fd8abd636531c36f620a0dfc82be71e6df2026c','password');
console.log('Decrypted = ',JSON.parse(decryptedData));
*/

module.exports.Encrypt = Encrypt;
module.exports.Decrypt = Decrypt;
module.exports.GetKey = GetKey;

