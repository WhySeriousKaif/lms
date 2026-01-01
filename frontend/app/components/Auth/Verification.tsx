"use client";
import React, { useState, useRef, FC, useEffect } from "react";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { HiX } from "react-icons/hi";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { useActivationMutation } from "@/app/redux/features/auth/authApi";
import { toast } from "react-hot-toast";

type Props = {
  activeItem: any;
  setOpen: (open: boolean) => void;
  setRoute: (route: string) => void;
};

type VerifyNumber = {
  "0": string;
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
};

const Verification: FC<Props> = ({ activeItem, setOpen, setRoute }) => {
  const token = useSelector((state: any) => state.auth.token);
  const [activation, { isLoading, isError, isSuccess, error, data }] = useActivationMutation();
  const [invalidError, setInvalidError] = useState<boolean>(false);
  const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
    "0": "",
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
  });
  const { theme } = useTheme();
  const hasHandledSuccess = useRef(false);

  // Backup useEffect in case .unwrap() doesn't work
  useEffect(() => {
    // Handle success from RTK Query (backup)
    if (isSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      console.log("✅ Activation successful (useEffect)! isSuccess:", isSuccess, "data:", data);
      const successMessage = (data as any)?.message || "Account activated successfully";
      toast.success(`${successMessage}. Please login to continue.`, {
        duration: 3000,
      });
      
      // Redirect to Login modal after 2 seconds
      setTimeout(() => {
        console.log("🔄 Redirecting to Login modal (useEffect)...");
        setRoute("Login");
        setOpen(false);
      }, 2000);
    }
    
    // Handle errors from RTK Query (backup)
    if (isError && !hasHandledSuccess.current) {
      console.error("❌ Activation error (useEffect):", error);
      if (error && "data" in error) {
        const errorData = error as any;
        toast.error(errorData.data?.message || "Invalid activation code");
      } else {
        toast.error("Invalid activation code");
      }
      setInvalidError(true);
    }
  }, [isSuccess, isError, error, data, setRoute, setOpen]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const verificationHandler = async () => {
    // Reset success flag when starting new verification
    hasHandledSuccess.current = false;
    setInvalidError(false);
    
    const verificationNumber = Object.values(verifyNumber).join("");
    if (verificationNumber.length !== 6) {
      setInvalidError(true);
      toast.error("Please enter all 6 digits");
      return;
    }
    
    if (!token) {
      toast.error("Activation token not found. Please register again.");
      setRoute("Sign-Up");
      return;
    }

    const activationData = {
      activation_token: token,
      activation_code: verificationNumber,
    };
    
    try {
      console.log("🚀 Calling activation...");
      const result = await activation(activationData).unwrap();
      console.log("✅ Activation result:", result);
      
      // Mark as handled
      hasHandledSuccess.current = true;
      
      // Show success toast with "Please login" message
      const successMessage = result?.message || "Account activated successfully";
      toast.success(`${successMessage}. Please login to continue.`, {
        duration: 3000,
      });
      
      // Redirect to Login modal after 2 seconds
      setTimeout(() => {
        console.log("🔄 Redirecting to Login modal...");
        setRoute("Login");
        setOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Activation error:", err);
      hasHandledSuccess.current = false;
      
      // Handle error
      if (err && "data" in err) {
        const errorData = err as any;
        const errorMessage = errorData.data?.message || "Invalid activation code";
        toast.error(errorMessage);
      } else {
        toast.error("Invalid activation code");
      }
      setInvalidError(true);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    setInvalidError(false);

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newVerifyNumber = { ...verifyNumber, [index]: value };
    setVerifyNumber(newVerifyNumber);

    // Handle focus movement
    if (value === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (value.length === 1 && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = String(index) as keyof VerifyNumber;
    if (e.key === "Backspace" && !verifyNumber[key] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

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
        Verify Your Account
      </h1>

      {/* Icon */}
      <div className="w-full flex items-center justify-center mt-2 mb-8">
        <div
          className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
          style={{
            backgroundColor: theme === 'dark' ? '#497DF2' : '#497DF2',
            border: `3px solid ${theme === 'dark' ? '#ffffff' : '#497DF2'}`,
          }}
        >
          <VscWorkspaceTrusted size={40} className="text-white" />
        </div>
      </div>

      {/* OTP Input Fields */}
      <div className="w-full m-auto flex items-center justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
        {Object.keys(verifyNumber).map((key, index) => (
          <input
            key={key}
            type="text"
            ref={inputRefs[index]}
            className={`w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px] bg-transparent border-[3px] rounded-[10px] flex items-center text-center text-xl sm:text-2xl font-bold font-Poppins focus:outline-none focus:ring-2 transition-all ${
              invalidError
                ? "shake border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500 dark:focus:border-white focus:border-blue-500"
            }`}
            style={{
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: theme === 'dark' ? 'transparent' : 'transparent',
              borderColor: invalidError 
                ? '#ef4444' 
                : theme === 'dark' 
                  ? '#ffffff' 
                  : 'rgba(0, 0, 0, 0.29)',
            }}
            placeholder=""
            maxLength={1}
            value={verifyNumber[key as keyof VerifyNumber]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={verificationHandler}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 font-Poppins shadow-md hover:shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* Go back to sign in */}
      <div className="text-center">
        <p
          className="text-sm text-gray-600 dark:text-gray-400 font-Poppins"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
        >
          Go back to sign in?{" "}
          <button
            type="button"
            onClick={() => setRoute("Login")}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline transition-colors"
            style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Verification;

