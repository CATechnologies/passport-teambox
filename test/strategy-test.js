var vows = require('vows');
var assert = require('assert');
var util = require('util');
var TeamboxStrategy = require('../lib/passport-teambox/strategy');


vows.describe('TeamboxStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new TeamboxStrategy({
        clientID: 'appkey',
        clientSecret: 'appsecret'
      },
      function() {});
    },
    
    'should be named teambox': function (strategy) {
      assert.equal(strategy.name, 'teambox');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new TeamboxStrategy({
        clientID: 'appkey',
        clientSecret: 'appsecret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{"type":"User","id":1,"first_name":"Patrick","last_name":"Heneise"}';
                
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'teambox');
        assert.equal(profile.id, '1');
        assert.equal(profile.displayName, 'Patrick Heneise');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new TeamboxStrategy({
        clientID: 'appkey',
        clientSecret: 'appsecret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
