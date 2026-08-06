const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authenticateUser = require('../src/middlewares/auth.middleware');

describe('Authentication Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {};

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should reject request when authentication token is missing', () => {
    authenticateUser(req, res, next);

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0];

    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal(
      'Authentication token is required'
    );
  });

  it('should reject request with invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    authenticateUser(req, res, next);

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0];

    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal(
      'Invalid authentication token'
    );
  });

  it('should authenticate request with valid token', () => {
    const token = jwt.sign(
      {
        userId: 'user-123',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    req.headers.authorization = `Bearer ${token}`;

    authenticateUser(req, res, next);

    expect(next.calledOnce).to.equal(true);
    expect(next.firstCall.args).to.have.length(0);

    expect(req.user).to.deep.equal({
      id: 'user-123',
    });
  });
});