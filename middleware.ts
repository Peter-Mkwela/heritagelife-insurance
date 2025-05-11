import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Retrieve token from cookies
  const token = req.cookies.get('auth_token')?.value;

  // Define role-based base paths
  const basePaths = ['/it_admin', '/system_admin', '/policyholder', '/stakeholder', '/agent'];

  // Allow public access to the base path (e.g., /it_admin) to handle embedded login
  const isBasePath = basePaths.includes(pathname);

  // Check if the path is a protected route but not a base path
  const isProtectedRoute =
    basePaths.some((basePath) => pathname.startsWith(basePath)) && !isBasePath;

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to the base path for the role (e.g., /it_admin)
      const basePath = basePaths.find((basePath) => pathname.startsWith(basePath));
      return NextResponse.redirect(new URL(basePath || '/', req.url));
    }
  }

  return NextResponse.next(); // Allow access for public or authenticated routes
}

// Middleware configuration for all protected paths
export const config = {
  matcher: [
    '/it_admin',
    '/it_admin/add_user/',
    '/it_admin/delete_user/',
    '/it_admin/approve_claim/',
    '/it_admin/charts/',
    '/it_backup/',

    '/system_admin',
    '/system_admin/add_beneficiary/',
    '/system_admin/cancel_policy/',
    '/system_admin/modify_policy/',
    '/system_admin/process_claim/',
    '/system_admin/remove_beneficiary/',

    '/policyholder',
    '/policyholder/application/',
    '/policyholder/make_claim/',
    '/policyholder/modifications/',
    '/policyholder/requests/',
    '/policyholder/view_policy/',
    '/policyholder/signup/',
    '/policyholder/resetpassword/',

    '/stakeholder',
    '/stakeholder/business_perfomance/',
    '/stakeholder/new_business/',
    '/stakeholder/view_profit/',

    '/agent',
    '/agent/business/',
    '/agent/commission/',
    '/agent/register/',
  ],
};
