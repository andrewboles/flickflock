const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/googleRedirect'
},
((accessToken, refreshToken, profile, done) => {
  // console.log(accessToken, refreshToken, profile)
  console.log('GOOGLE BASED OAUTH VALIDATION GETTING CALLED');
  return done(null, profile);
})));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.BACKEND_URL, // relative or absolute path
  profileFields: ['id', 'displayName', 'email', 'picture']
},
((accessToken, refreshToken, profile, done) => {
  console.log(profile);
  console.log('FACEBOOK BASED OAUTH VALIDATION GETTING CALLED');
  return done(null, profile);
})));

// These functions are required for getting data To/from JSON returned from Providers
passport.serializeUser((user, done) => {
  console.log('I should have jack ');
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  console.log('I wont have jack shit');
  done(null, obj);
});
