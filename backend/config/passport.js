const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../lib/prisma');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists by Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            return done(null, user);
          }

          // Check if email already exists (user registered with email/password)
          user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (user) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                name: user.name || profile.displayName,
              },
            });
            return done(null, user);
          }

          // Create new user
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              password: null, // No password for Google users
              role: 'student',
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
