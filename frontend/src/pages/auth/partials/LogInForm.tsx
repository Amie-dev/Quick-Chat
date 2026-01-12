import { Loader2, Lock, Mail } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import {z} from "zod"
import { useAuthStore } from "../../../stores/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../../services/authService";
import { toast } from "sonner";
interface LogInFormProps {
  onSwitch: () => void;
}


const loginSchema = z.object({
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"})
})

type LoginFormData = z.infer<typeof loginSchema>




const LogInForm: React.FC<LogInFormProps> = ({ onSwitch }) => {



     const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const { register, handleSubmit, formState: { errors }} = useForm({
        resolver: zodResolver(loginSchema)
    })

    const mutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            const { user } =  data;
            setUser(user);
            toast.success("Login successfull!")
            return navigate('/chat');
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "Login failed"
            toast.error(msg);
        }
    })

    const onSubmit = (data: LoginFormData) => mutation.mutate(data);
  return (
    <>
      <h2 className="text-2xl font-bold text-dark mb-2">
        Sign In to Your Account
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Enter your credentials to continue
      </p>


 <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="email" className="block text-gray-700 mb-2 text-sm">Email</label>
                <div className="relative mb-2">
                    <Mail className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2"/>
                    <input 
                        {...register('email')}
                        type="email"
                        className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                    />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="password" className="block text-gray-700 mb-2 text-sm">Password</label>
                <div className="relative mb-2">
                    <Lock className="absolute insset-y-0 left-3 size-5 text-gray-400 top-1/2 -translate-y-1/2"/>
                    <input 
                        {...register('password')}
                        type="password"
                        className="text-sm w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="******"
                    />
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-4 w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center"
            >
                {mutation.isPending ? <Loader2 className="animate-spin size-5"/> : "Sign In"}
            </button>
        </form>




      <div className="text-center text-sm mt-4">
        <span className="text-gray-600">Don't have an account? </span>
        <span
          onClick={onSwitch}
          className="text-primary font-medium cursor-pointer hover:underline"
        >
          Sign Up
        </span>
      </div>
    </>
  );
};

export default LogInForm;
