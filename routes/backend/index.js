var express = require('express');
var router = express.Router();
// var app = express();

router.use('/items/', require("./items"));
router.use('/groups/', require("./groups"));
router.use('/users/', require("./users"));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main Page' });
});


module.exports = router;
