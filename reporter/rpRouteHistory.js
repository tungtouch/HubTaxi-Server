/**
 * Created by chris on 6/26/14.
 */

//var dbPro = require('./config/db-provider-mongo').MongooseDbProvider,
var rp = {};

var rpRoute = function() {
    console.log('hah');
};

var rp2 = function() {
    console.log('test modules');
};


rp.rpRoute = rpRoute;
rp.rp2 = rp2;

module.exports = rp;