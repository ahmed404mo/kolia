import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. قراءة البيانات
  const role = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;
  
  // 🔥 الجديد: هل المستخدم جاي من زرار الخروج؟
  const isLogout = request.nextUrl.searchParams.get('out') === 'true';

  // ----------------------------------------------------
  // 🚑 حالة الطوارئ: لو جاي يعمل خروج، امسح الكوكي ودخله Login
  // ----------------------------------------------------
  if (path === '/login' && isLogout) {
    const response = NextResponse.next();
    response.cookies.delete('user_role'); // مسح إجباري من الميدل وير
    return response;
  }

  // --- القواعد العادية ---

  // أ) لو المستخدم مش مسجل دخول وحاول يدخل صفحة محمية
  if (!role && (path.startsWith('/dashboard') || path.startsWith('/student'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ب) لو هو "طالب" وحاول يدخل لوحة الأدمن
  if (role === 'STUDENT' && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // ج) لو هو "أدمن" وحاول يدخل صفحة الطالب
  if (role === 'ADMIN' && path.startsWith('/student')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // د) لو هو مسجل دخول وحاول يرجع لصفحة Login (من غير ما يعمل خروج)
  if (role && path === '/login' && !isLogout) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard', request.url));
      if (role === 'STUDENT') return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/student/:path*', 
    '/login'
  ],
};