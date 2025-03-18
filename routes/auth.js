import express from "express";
import { config } from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import passport from "passport";
import { Strategy } from "passport-local";
import jwt from "jsonwebtoken"; 

config(); // Load environment variables

const router = express.Router();
router.use(express.json());

//PostgreSQL Connection
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

//Initialize Passport 
router.use(passport.initialize());

// Student Login API 
router.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password cannot be blank')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local-login', async (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET, // Use a strong secret key
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        res.json({ message: `Hello ${user.name}, start searching accommodation`, token });
    })(req, res, next);
});

//  Student Authentication Strategy 
passport.use('local-login', new Strategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return done(null, false, { message: 'User not found' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        return isMatch ? done(null, user) : done(null, false, { message: 'Incorrect password' });
    } catch (err) {
        return done(err);
    }
}));

export default router;
