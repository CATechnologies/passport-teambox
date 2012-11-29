var vows = require('vows');
var assert = require('assert');
var util = require('util');
var teambox = require('../lib/passport-teambox');


vows.describe('passport-teambox').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(teambox.version);
    },
  },
  
}).export(module);
