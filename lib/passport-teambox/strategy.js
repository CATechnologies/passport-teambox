/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Teambox authentication strategy authenticates requests by delegating
 * to Teambox using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Teambox application's client id
 *   - `clientSecret`  your Teambox application's client secret
 *   - `callbackURL`   URL to which Teambox will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new TeamboxStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/teambox/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://teambox.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://teambox.com/oauth/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'teambox';
  
  // NOTE: Due to OAuth 2.0 implementations arising at different points and
  //       drafts in the specification process, the parameter used to denote the
  //       access token is not always consistent.    As of OAuth 2.0 draft 22,
  //       the parameter is named "access_token".  However, Teambox's
  //       implementation expects it to be named "oauth_token".  For further
  //       information, refer to: http://developers.teambox.com/docs/api/authentication
  this._oauth2.setAccessTokenName("oauth_token");
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Teambox.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `teambox`
 *   - `id`               the user's Teambox ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.get('https://teambox.com/api/2/account', accessToken, function (err, body, res) {
    if (err) { return done(err); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'teambox' };
      profile.id = json.id;
      profile.displayName = json.first_name + " " + json.last_name;
      profile.name = {
        "givenName": json.first_name,
        "familyName": json.last_name
      };
      profile.emails = [{
        "value": json.email,
        "type": "work"
      }];
      
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
