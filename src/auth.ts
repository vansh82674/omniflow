import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Access",
      credentials: {
        password: { label: "Password (hint: omniflow)", type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials.password === "omniflow") {
          return { id: "1", name: "Enterprise Admin" }
        }
        return null
      },
    }),
  ],
  pages: {
    // NextAuth provides a default signin page, which is perfect for MVP.
  }
})
