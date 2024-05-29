import jwt from 'jsonwebtoken';


export default class Authentication {

    static secretKey;

    setSecretKey = (secretKey) => {
        this.secretKey = secretKey;
    }

    /**
     * Generates a JWT token for the given user ID.
     * @param {string} userId - The user ID.
     * @returns {string} The generated JWT token.
    */
    generateToken = (userId) => {
        if(!this.secretKey) throw new Error('Secret key not set');
        
        const body = { userId: userId };
        const tk = jwt.sign(body, this.secretKey, { expiresIn: '60m' });
        return tk;
    };

    /**
    * Middleware function to authenticate a JWT token.
    * @param {Object} req - The request object.
    * @param {Object} res - The response object.
    * @param {Function} next - The next middleware function.
    */
    authenticateToken = (req, res, next) => {
        if(!this.secretKey) throw new Error('Secret key not set');
        
        const tokenHeader = req.headers['authorization'];
        const token = tokenHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Token de autenticacao nao fornecido' });
        }

        jwt.verify(token, this.secretKey, (err, decoded) => {
            console.log('verify');
            if (err) {
                console.log(err);
                return res.status(403).json({ message: 'Token de autenticacao invalido' });
            }
            req.userId = decoded.userId;
            console.log(req.userId);
            next();
        });
    };


}