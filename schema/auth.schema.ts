import { z } from "zod";

export const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be less than 20 characters")
    .trim(),

  email: z.email("Please enter a valid email address").toLowerCase(),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),

  cCode: z.string(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be less than 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    ),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be less than 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    ),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
});

export const passwordChecks = {
  minLength: z.string().min(8),
  maxLength: z.string().max(20),
  hasUpperCase: z.string().regex(/[A-Z]/),
  hasLowerCase: z.string().regex(/[a-z]/),
  hasNumber: z.string().regex(/\d/),
  hasSpecialChar: z.string().regex(/[@$!%*?&]/),
};
