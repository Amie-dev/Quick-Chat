import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";

interface RegisterFormProps {
  onSwitch: () => void;
}

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "FullName more then two Char" }),
    userName: z
      .string()
      .regex(/^[a-z0-9_]+$/, {
        message:
          "Username can only contain lowercase letters, numbers, and underscores",
      })
      .min(2, { message: "Username is too short" })
      .max(12, { message: "Username is too long" })
      .transform((val) => val.toLocaleLowerCase()),
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      onSwitch();
      toast.success("Account created You can now sign in");
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(msg);
    },
  });

  const onSubmit = (data: RegisterFormData) => mutation.mutate(data);

  return (
    <>
      <h2 className="text-2xl font-bold text-dark mb-2">Create Your Account</h2>
      <p className="text-gray-500 text-sm mb-8">Join our community</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="fullName"
            className="block text-gray-700 mb-2 text-sm"
          >
            Full Name
          </label>
          <div className="relative mb-2">
            <User className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2" />
            <input
              {...register("fullName")}
              className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="userName"
            className="block text-gray-700 mb-2 text-sm"
          >
            UserName
          </label>
          <div className="relative mb-2">
            <User className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2" />
            <input
              {...register("userName")}
              className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="johndoe"
            />
          </div>
          {errors.userName && (
            <p className="text-red-500 text-sm">{errors.userName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2 text-sm">
            Email
          </label>
          <div className="relative mb-2">
            <Mail className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2" />
            <input
              {...register("email")}
              type="email"
              className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 mb-2 text-sm"
          >
            Password
          </label>
          <div className="relative mb-2">
            <Lock className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2" />
            <input
              {...register("password")}
              type="password"
              className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="******"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 mb-2 text-sm"
          >
            Confirm Password
          </label>
          <div className="relative mb-2">
            <Lock className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2" />
            <input
              {...register("confirmPassword")}
              type="password"
              className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="******"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-4 w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      <div className="text-center text-sm mt-4">
        <span className="text-gray-600">Already have an account? </span>
        <span
          onClick={onSwitch}
          className="text-primary font-medium cursor-pointer hover:underline"
        >
          Sign In
        </span>
      </div>
    </>
  );
};

export default RegisterForm;
