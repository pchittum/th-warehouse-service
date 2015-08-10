var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

var equipmentCollName = 'equipment';

/* base warehouse url */
router.get('/', function(req, res, next) {
  res.send({msg:'There is nothing here.'});
});

//fetch all equipment in that collection
router.get('/getallequipment', function(req, res){
  var db = req.db;
  var collection = db.get(equipmentCollName);
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

//fetch a single equipment record by its id value
router.get('/equipment/:id', function(req, res){
  var db = req.db;
  var collection = db.get(equipmentCollName);

  var eqId = req.params.id;

  var queryJSON = {"_id":eqId};

  //check for Id passed in. If not, fail with message.
  //minimally viable value would have to be 24 chars long...but there
  //is probably a better way to detect actual valid ObjectIds
  //probably should also check if there is an API to test for valid Mongo ObjectId's
  if (eqId.length === 24){
    collection.find(queryJSON,{},function(e,docs){
      if (e){
        var messageTxt = 'There was an error in the MongoDB layer passing the query' + JSON.stringify(queryJSON);
        res.send({msg:msgTxt});
      } else {
        console.log(docs);
        res.json(docs);
      }
    });
  } else {
    res.send({msg:'A valid record Id must be used. Use the following: /equipment/<record_id_goes_here>. Valid record Ids conform to MongoDB ObjectId rules of 24 hexadecimal characters.'});
  }
});

//add a query REST endpoint where we can search for fields that equal a value
//for querystring params, use req.query.<paramname>
router.get('/query', function(req, res){
  var db = req.db;
  var objName = req.query.from;
  var collection = db.get(objName);
  var queryObj = {};
  var fieldsObj = {};

  console.log(req.query);
  console.log(objName);

  //test for object in from param
  if (!objName){
    res.json({msg:'The \'from\' query parameter is required and must match a valid object such as \'equipment\''});
  } else {
    console.log('we have an object');
    //unwrap remaining query params.
    if (req.query.select){
      fieldsArr = req.query.select.split(',');
      fieldsArr.forEach(function(item, index, array){
        fieldsObj[item] = 1;
      });
      console.log(fieldsObj.replacement);
    }

    if (req.query.where){
      queryArr = req.query.where.split(',');
      queryArr.forEach(function(item, index, array){
        var nameValue = item.split('=');
        var val = nameValue[1];
        queryObj[nameValue[0]] = (val === 'true' || val === 'false') ?
                                    Boolean(val) :
                                    (parseInt(val) === NaN)
                                      ? val :
                                      parseInt(val);
      });
      console.log(JSON.stringify(queryObj));
    }

    collection.find(queryObj, fieldsObj, function(err,docs){
      if (err){
        res.send({msg:'there was an error retrieving data from the database. Check your query is correctly formed and try again.'});
      } else {
        res.json(docs);
      }
    });
  }
});


router.post('/addequipment', function(req, res){
  var db = req.db;
  var collection = db.get(equipmentCollName);
  collection.insert(req.body, function(err, result){
    res.send((err === null ) ? {msg: ''} : {msg: err});
  });
});

router.post('/initequipment', function(req,res){
  var db = req.db;
  var fs = req.fs;
  var equipArray = [];
  var collection = db.get(equipmentCollName);
  collection.find({},{},function(e,docs){
    if (e){
      //error
      res.send({msg:e});
    } else {
      if (docs.length > 0){
        //init only once, send msg if already
        res.send({msg:'Equipment Init Already Complete.'})
      } else {
        //no equipment found, we need to init
        //not sure if this filepath is best practice when using static location
        fs.readFile('public/json/equipment.json', function(err, data){
          if (err){
            res.send({msg:err});
          } else {
            //equipArray = data.toString();
            //take read file buffer, convert to string, then JSON
            //should maybe test buffer.json()
            collection.insert(JSON.parse(data.toString()), function(err, result){
              res.send((err === null ) ? {msg: ''} : {msg: err});
            });
          }
        });
      }
    }
  });
});

module.exports = router;
