import LoginMethods from './LoginMethods.js';
import express from 'express';
import Authenticate from './Authentication.js';
import bcrypt from 'bcrypt';

const auth = new Authenticate();
const db = new LoginMethods();

const signupRouter = express.Router();
const loginRouter = express.Router();


/**
 * Create a new user in the database
 * @route POST /signup
 * @async
 * @param {string} username - The username to create
 * @param {string} password - The password to create
 */
signupRouter.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Usuario ou senha nao informados' });

    try {
        const user = await db.getUser("users", [{ username: username }]);
        if (user.length > 0) {
            return res.status(400).json({ message: 'Usuario ja existe' });
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            const newuser =
            {
                username: username,
                password: passwordHash,
                isactive: 1
            };
            await db.createUser("users", newuser);

            res.status(201).json({ message: 'Usuario cadastrado com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuario:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

/**
 * Authenticate a user
 * @route POST /login
 * @async
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to authenticate
 * @returns {string} token - The JWT token to authenticate the user
 */
loginRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUser("users", [{ username: username, junction: 'AND' }]);
        if (!user[0]) {
            return res.status(404).json({ message: 'Usuario nao encontrado' });
        } else {
            const match = await bcrypt.compare(password, user[0].password);
            if (!match) {
                return res.status(401).json({ message: 'Credenciais invalidas - Senha incorreta' });
            }

            const token = auth.generateToken(user[0].id);

            res.json({ token });
        }
    } catch (error) {
        console.error('Erro ao autenticar usuario:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});


export { db, auth, signupRouter, loginRouter }
