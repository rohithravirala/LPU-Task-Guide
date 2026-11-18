import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { findDemoStudent, findStudentByRegistrationNumber } from '@/data/store';

function signedIn(student, message) {
  const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { name, registrationNumber, program } = student;
  return NextResponse.json({ success: true, message, data: { token, student: { name, registrationNumber, program } } });
}

function failed(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function login(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const registrationNumber = String(body.registrationNumber ?? '').trim().toUpperCase();
    const password = String(body.password ?? '');
    if (!registrationNumber || !password) return failed('Enter your registration number and password', 400);

    const student = findStudentByRegistrationNumber(registrationNumber);
    if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
      return failed('Registration number or password is incorrect', 401);
    }
    return signedIn(student, 'Login successful');
  } catch (error) {
    console.error('Login failed:', error.message);
    return failed('Login failed. Please try again.', 500);
  }
}

export async function demoLogin() {
  const student = findDemoStudent();
  if (!student) return failed('The demo account is not available', 404);
  return signedIn(student, 'Signed in to the demo account');
}
