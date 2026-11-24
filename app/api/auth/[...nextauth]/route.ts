import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params;
  return handler(request, { params: resolvedParams });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params;
  return handler(request, { params: resolvedParams });
}

