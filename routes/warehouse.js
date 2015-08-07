var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

var equipmentCollName = 'equipment';

/* base warehouse url */
router.get('/', function(req, res, next) {
  res.send('yo');
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
  console.log(eqId);

  //must test with findOne
  collection.find({"_id":eqId},{},function(e,docs){
    console.log(docs);
    res.json(docs);
  });
});

//add a query REST endpoint where we can search for fields that equal a value
//for querystring params, use req.query.<paramname>

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
