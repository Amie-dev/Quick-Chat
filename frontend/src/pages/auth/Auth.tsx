import React, { useState } from "react";
import { Mail } from "lucide-react";
import LogInForm from "./partials/LogInForm";
import RegisterForm from "./partials/RegisterForm";
const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <>
      <div className="min-h-screen w-full bg-white rounded-2xl flex flex-col md:flex-row">
        <div className="w-full md:w-6/12 bg-sky-500 p-8 text-white flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <Mail className="size-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">WelCome To Quick Chat</h1>
            <p>Connect With Friends and Family</p>
          </div>
          <div className="mb-10 text-center">
            <p className="text-sm opacity-80">Join 100M User Today</p>
          </div>
        </div>
        <div className="w-full md:w-6/12 flex p-8 justify-center items-center">
          {isLogin ? (
            <div className="w-full md:w-100">
              <LogInForm onSwitch={() => setIsLogin(!isLogin)} />
            </div>
          ) : (
            <div className="w-full md:w-100">
              <RegisterForm onSwitch={() => setIsLogin(!isLogin)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Auth;
