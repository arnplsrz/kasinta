import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import prisma from '../config/database';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Extract profile data
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user already exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (user) {
          // User exists with this Google account
          return done(null, user);
        }

        // Check if user exists with this email (account linking)
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Link Google account to existing email/password account
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              authProvider: user.password ? 'both' : 'google',
            },
          });
          return done(null, updatedUser);
        }

        // Create new user with Google OAuth
        const newUser = await prisma.user.create({
          data: {
            email,
            googleId,
            name,
            password: null,
            authProvider: 'google',
            age: null,
            gender: null,
          },
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
