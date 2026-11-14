import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

const BCRYPT_ROUNDS = 12;
let dummyHash; // used to keep login timing similar whether or not the email exists

async function getDummyHash() {
  dummyHash ??= await bcrypt.hash('lpu-uni-path-timing-placeholder', BCRYPT_ROUNDS);
  return dummyHash;
}

export function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    registrationNumber: user.registrationNumber ?? null,
    createdAt: user.createdAt,
  };
}

/** Creates a student account. The role is fixed server-side; clients cannot choose it. */
export async function registerStudent({ name, email, password, registrationNumber }) {
  const [emailTaken, regTaken] = await Promise.all([
    User.exists({ email }),
    registrationNumber ? User.exists({ registrationNumber }) : null,
  ]);

  const errors = {};
  if (emailTaken) errors.email = 'An account with this email already exists';
  if (regTaken) errors.registrationNumber = 'This registration number is already registered';
  if (Object.keys(errors).length) {
    throw ApiError.conflict('Some of these details are already in use', errors);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return User.create({ name, email, passwordHash, registrationNumber, role: 'student' });
}

export async function verifyCredentials({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const hash = user?.passwordHash ?? (await getDummyHash());
  const matches = await bcrypt.compare(password, hash);

  if (!user || !matches) {
    // Same message for unknown email and wrong password (no account enumeration).
    throw ApiError.unauthorized('Email or password is incorrect');
  }
  return user;
}
