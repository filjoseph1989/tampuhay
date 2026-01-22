import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: number
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: number
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: Role
  }
}
