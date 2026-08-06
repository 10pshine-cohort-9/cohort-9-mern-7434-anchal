const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const authService = require('../src/services/auth.service');

describe('Auth Service', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      sinon.stub(User, 'create').resolves({
        id: 'user-123',
        name: 'Test User',
        email: 'test@gmail.com',
      });

      const result = await authService.registerUser({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'Password123',
      });

      expect(result).to.deep.equal({
        id: 'user-123',
        name: 'Test User',
        email: 'test@gmail.com',
      });
    });

    it('should reject duplicate email', async () => {
      sinon.stub(User, 'findOne').resolves({
        id: 'existing-user',
        email: 'test@gmail.com',
      });

      try {
        await authService.registerUser({
          name: 'Test User',
          email: 'test@gmail.com',
          password: 'Password123',
        });

        throw new Error('Expected service to throw an error');
      } catch (error) {
        expect(error.statusCode).to.equal(409);
        expect(error.message).to.equal('Email is already registered');
      }
    });
  });

  describe('loginUser', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 12);

      sinon.stub(User, 'findOne').resolves({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const result = await authService.loginUser({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result).to.have.property('token');

      expect(result.user).to.deep.equal({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should reject login with invalid email', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      try {
        await authService.loginUser({
          email: 'wrong@example.com',
          password: 'Password123',
        });

        throw new Error('Expected service to throw an error');
      } catch (error) {
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Invalid email or password');
      }
    });

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash(
        'CorrectPassword123',
        12
      );

      sinon.stub(User, 'findOne').resolves({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });

      try {
        await authService.loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123',
        });

        throw new Error('Expected service to throw an error');
      } catch (error) {
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Invalid email or password');
      }
    });
  });
});