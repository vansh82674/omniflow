import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials?.password === "password123" && credentials?.email) {
          return {
            id: "1",
            name: "Enterprise Admin",
            email: credentials.email as string,
            image: "https://i.pravatar.cc/150?u=admin",
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  }
})
