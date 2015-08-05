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

module.exports = router;
