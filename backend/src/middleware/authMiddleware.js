import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function getStudentId(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET).studentId;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ success: false, message: 'Please log in again' }, { status: 401 });
}
