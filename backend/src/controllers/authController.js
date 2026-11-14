import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { findStudentByRegistrationNumber } from '@/data/store';

// Creates the login token. It proves "this student is logged in" and expires after 7 days.
function createToken(student) {
  return jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// The student details the frontend is allowed to see (never the password hash).
function publicStudent(student) {
  return { name: student.name, registrationNumber: student.registrationNumber, program: student.program };
}

function badRequest(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// POST /api/auth/login   body: { registrationNumber, password }
// Accounts are listed in src/data/students.js (there is no sign-up).
export async function login(request) {
  try {
    const body = await request.json().catch(() => ({}));
    // String() makes sure nobody can send an object here
    const registrationNumber = String(body.registrationNumber ?? '').trim().toUpperCase();
    const password = String(body.password ?? '');

    if (!registrationNumber || !password) return badRequest('Enter your registration number and password');

    const student = findStudentByRegistrationNumber(registrationNumber);

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
