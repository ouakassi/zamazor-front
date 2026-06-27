"use client";
 
import { Leaf } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import heroProtein from "@/assets/images/hero_protein.png";
 
export const FullScreenLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 8;
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    if (valid) {
      // Submission logic goes here
      console.log("Login submitted!");
      console.log("Email:", email);
      alert("Login submitted!");
      setEmail("");
      setPassword("");
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        
        {/* Background decorative elements */}
        <div className="w-[15rem] h-[15rem] bg-lime-400/30 absolute z-1 rounded-full -bottom-16 -left-16 blur-2xl"></div>
        <div className="w-[8rem] h-[5rem] bg-emerald-500/20 absolute z-1 rounded-full -top-10 -right-10 blur-xl"></div>
 
        {/* Left Side: Premium Supplement Showcase Card */}
        <div 
          className="relative bg-emerald-950 text-white p-8 md:p-12 md:w-1/2 flex flex-col justify-end overflow-hidden min-h-[320px] md:min-h-[500px]"
          style={{ 
            backgroundImage: `url(${heroProtein})`, 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        >
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent z-0"></div>
          
          <div className="relative z-10 flex flex-col justify-end h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400 text-emerald-950 text-xs font-semibold tracking-wide w-fit mb-4 uppercase">
              100% Organic & Clean
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight relative text-white mb-3">
              Fuel your journey to peak health.
            </h1>
            <p className="text-sm md:text-base text-gray-200/90 leading-relaxed max-w-md">
              Get scientifically formulated supplements, personalized health tracking, and exclusive founder rewards. Let's make every workout count.
            </p>
          </div>
        </div>
 
        {/* Right Side: Log In Form */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white dark:bg-gray-900 z-10 text-gray-900 dark:text-gray-100 justify-center">
          <div className="flex flex-col items-start mb-8">
            <div className="text-emerald-600 dark:text-lime-400 mb-4 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-2xl">
              <Leaf className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-left text-sm text-gray-500 dark:text-gray-400">
              Sign in to your Zamazor account to continue
            </p>
          </div>
 
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className={`text-sm w-full py-2.5 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-emerald-600 focus:border-transparent transition-all ${
                  emailError 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1.5 font-medium">
                  {emailError}
                </p>
              )}
            </div>
 
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-emerald-700 dark:text-lime-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className={`text-sm w-full py-2.5 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-emerald-600 focus:border-transparent transition-all ${
                  passwordError 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1.5 font-medium">
                  {passwordError}
                </p>
              )}
            </div>
 
            <button
              type="submit"
              className="w-full bg-emerald-950 hover:bg-emerald-900 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-emerald-950 font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-center"
            >
              Sign In
            </button>
 
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
              Don't have an account?{" "}
              <Link to={APP_ROUTES.AUTH.REGISTER} className="text-emerald-700 dark:text-lime-400 font-semibold hover:underline">
                Create a new account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
