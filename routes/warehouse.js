var express = require('express');
var router = express.Router();

var equipmentCollName = 'equipment';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('yo');
});

router.get('/getallequipment', function(req, res){
  var db = req.db;
  var collection = db.get(equipmentCollName);
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
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
