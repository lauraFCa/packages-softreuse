import assert from 'assert';
import Authentication from '../Authentication';

describe('Authentication Tests', () => {

    const auth = new Authentication();

    it('Should create a string token', () => {
        auth.setSecretKey('mysecretkey');
        const token = auth.generateToken(12);
        assert(typeof token === 'string' && token.trim().length > 0, 'String is empty or not a string');
    });

    it('Should throw an error for non key', () => {
        assert.throws(() => { new Authentication().generateToken(12); }, Error, 'Secret key not set');
    });

});