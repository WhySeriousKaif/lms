"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { HiX } from "react-icons/hi";
import { useTheme } from "next-themes";
import { useLoginMutation } from "@/app/redux/features/auth/authApi";
import toast from "react-hot-toast";

type Props = {
  activeItem: any;
  setOpen: (open: boolean) => void;
  setRoute: (route: string) => void;
};

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login: React.FC<Props> = ({ activeItem, setOpen, setRoute }) => {
  const [show, setShow] = useState(false);
  const { theme } = useTheme();
  const [login, { isLoading, isError, isSuccess, error, data }] = useLoginMutation();
  const hasHandledSuccess = useRef(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      hasHandledSuccess.current = false;
      await login({
        email: values.email,
        password: values.password,
      });
    },
  });
  const { errors, touched, handleChange, handleSubmit, handleBlur, values } = formik;

  useEffect(() => {
    if (isSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      toast.success("Login successfully");
      // Close modal after a longer delay to allow Redux state to update and Header to re-render
      setTimeout(() => {
        setOpen(false);
        // Force window refresh to ensure Header updates
        window.dispatchEvent(new Event('storage'));
      }, 2000);
    }
    if (isError && !hasHandledSuccess.current) {
      let errorMessage = "Login failed";
      if (error && "data" in error) {
        const errorData = error as any;
        errorMessage = errorData.data?.message || "Login failed";
      }
      toast.error(errorMessage);
    }
  }, [isSuccess, isError, error, setOpen]);

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8">
      {/* Close Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          aria-label="Close modal"
        >
          <HiX size={24} />
        </button>
      </div>

      {/* Title */}
      <h1 
        className="text-2xl sm:text-3xl font-bold text-center mb-8 text-black dark:text-white font-Poppins"
        style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
      >
        Login with ELearning
    </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-Poppins"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Enter your Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 font-Poppins ${
              errors.email && touched.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            } bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
            placeholder="loginmail@gmail.com"
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-sm font-Poppins">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-Poppins"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Enter your password
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 font-Poppins ${
                errors.password && touched.password
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              } bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
              placeholder="password!@%"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-red-500 text-sm font-Poppins">{errors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 font-Poppins shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Social Login Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <span 
          className="px-4 text-sm text-gray-500 dark:text-gray-400 font-Poppins"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
        >
          Or join with
        </span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          type="button"
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm hover:shadow-md"
          aria-label="Login with Google"
        >
          <FcGoogle size={24} />
        </button>
        <button
          type="button"
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-700 dark:hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
          aria-label="Login with GitHub"
        >
          <AiFillGithub size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p 
          className="text-sm text-gray-600 dark:text-gray-400 font-Poppins"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
        >
          Not have any account?{" "}
          <button
            type="button"
            onClick={() => setRoute("Sign-Up")}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline transition-colors"
            style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
