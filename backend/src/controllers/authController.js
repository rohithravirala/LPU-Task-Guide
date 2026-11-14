import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

// Creates the login token. It proves "this student is logged in" and expires after 7 days.
function createToken(student) {
  return jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// The student details the frontend is allowed to see (never the password hash).
function publicStudent(student) {
  return {
    name: student.name,
    registrationNumber: student.registrationNumber,
    program: student.program,
    isDemo: Boolean(student.isDemo),
  };
}

function badRequest(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// POST /api/auth/register   body: { name, registrationNumber, program, password }
export async function register(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();
    const registrationNumber = String(body.registrationNumber ?? '').trim().toUpperCase();
    const program = String(body.program ?? '').trim();
    const password = String(body.password ?? '');

    if (name.length < 2) return badRequest('Please enter your full name');
    if (!/^[A-Z0-9]{4,15}$/.test(registrationNumber)) {
      return badRequest('Registration number should be 4 to 15 letters or numbers');
    }
    if (password.length < 8) return badRequest('Password must be at least 8 characters');

    await connectDB();
    if (await Student.exists({ registrationNumber })) {
      return badRequest('An account with this registration number already exists. Please sign in.', 409);
    }

    // Store only a bcrypt hash of the password, never the password itself
    const passwordHash = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, registrationNumber, program, passwordHash });

    return NextResponse.json(
      { success: true, message: 'Account created', data: { token: createToken(student), student: publicStudent(student) } },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return badRequest('An account with this registration number already exists. Please sign in.', 409);
    }
    console.error('Sign up failed:', error.message);
    return badRequest('Sign up failed. Please try again.', 500);
  }
}

// POST /api/auth/login   body: { registrationNumber, password }
export async function login(request) {
  try {
    const body = await request.json().catch(() => ({}));
    // String() makes sure nobody can send an object here (protects the database query)
    const registrationNumber = String(body.registrationNumber ?? '').trim().toUpperCase();
    const password = String(body.password ?? '');

    if (!registrationNumber || !password) return badRequest('Enter your registration number and password');

    await connectDB();
    const student = await Student.findOne({ registrationNumber });

    // Compare the typed password with the stored bcrypt hash
    const passwordIsCorrect = student && (await bcrypt.compare(password, student.passwordHash));
    if (!passwordIsCorrect) {
      // Same message for both cases, so nobody can guess which numbers exist
      return badRequest('Registration number or password is incorrect', 401);
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { token: createToken(student), student: publicStudent(student) },
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return badRequest('Login failed. Please try again.', 500);
  }
}
