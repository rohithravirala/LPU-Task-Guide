import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// The frontend sends the login token in a header:  Authorization: Bearer <token>
// This returns the student's id from a valid token, or null if the token is
// missing, wrong or expired.
export function getStudentId(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return payload.studentId;
  } catch {
    return null;
  }
}

// Standard answer when a protected API is called without a valid login.
export function unauthorized() {
  return NextResponse.json({ success: false, message: 'Please log in again' }, { status: 401 });
}
