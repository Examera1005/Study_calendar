import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password: string) => {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error("Password must contain both letters and numbers");
        }
      },
    }),
  ],
});
