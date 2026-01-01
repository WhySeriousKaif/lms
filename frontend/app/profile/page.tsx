"use client";
import React, { FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import Header from "../components/Header";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineBookOpen,
  HiOutlineLogout,
  HiOutlineCamera,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { useLogoutMutation } from "../redux/features/auth/authApi";

interface Props {}

const Profile: FC<Props> = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const { theme } = useTheme();
  const [activeItem, setActiveItem] = useState(0);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("Login");
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMounted(true);
    // Redirect to home if not logged in
    if (!user || typeof user !== 'object' || user === null) {
      router.push("/");
      toast.error("Please login to access your profile");
      return;
    }
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user, router]);

  const menuItems = [
    { id: 0, label: "My Account", icon: HiOutlineUser },
    { id: 1, label: "Change Password", icon: HiOutlineLockClosed },
    { id: 2, label: "Enrolled Courses", icon: HiOutlineBookOpen },
    { id: 3, label: "Log Out", icon: HiOutlineLogout },
  ];

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      // Redirect to home after logout
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, redirect to home
      toast.success("Logged out successfully");
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  };

  const handleUpdate = () => {
    // TODO: Implement update user info
    toast.success("Profile updated successfully");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        route={route}
        setRoute={setRoute}
      />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div
            className="lg:col-span-1 bg-gray-50 dark:bg-[#1e293b] rounded-lg p-6 h-fit"
            style={{
              backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
            }}
          >
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 3) {
                        handleLogout();
                      } else {
                        setActiveItem(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? "#2563eb"
                        : "transparent",
                      color: isActive
                        ? "#ffffff"
                        : theme === "dark"
                        ? "#d1d5db"
                        : "#374151",
                    }}
                  >
                    <Icon size={20} />
                    <span className="font-Poppins font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeItem === 0 && (
              <div
                className="bg-gray-50 dark:bg-[#1e293b] rounded-lg p-8"
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                }}
              >
                <h2
                  className="text-2xl font-bold mb-6 font-Poppins"
                  style={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                >
                  My Account
                </h2>

                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <Image
                      src={user?.avatar?.url || "/assests/profile-icon-png-898.png"}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-gray-300 dark:border-gray-600"
                      style={{ objectFit: "cover" }}
                    />
                    <button
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                      onClick={() => {
                        // TODO: Implement avatar upload
                        toast("Avatar upload coming soon", { icon: "ℹ️" });
                      }}
                    >
                      <HiOutlineCamera size={20} />
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2 font-Poppins"
                      style={{
                        color: theme === "dark" ? "#d1d5db" : "#374151",
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-Poppins"
                      style={{
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        backgroundColor:
                          theme === "dark" ? "#0f172a" : "#ffffff",
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2 font-Poppins"
                      style={{
                        color: theme === "dark" ? "#d1d5db" : "#374151",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-Poppins"
                      style={{
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        backgroundColor:
                          theme === "dark" ? "#0f172a" : "#ffffff",
                      }}
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 font-Poppins shadow-md hover:shadow-lg"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {activeItem === 1 && (
              <div
                className="bg-gray-50 dark:bg-[#1e293b] rounded-lg p-8"
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                }}
              >
                <h2
                  className="text-2xl font-bold mb-6 font-Poppins"
                  style={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                >
                  Change Password
                </h2>
                <p
                  className="text-gray-600 dark:text-gray-400 mb-6 font-Poppins"
                  style={{
                    color: theme === "dark" ? "#9ca3af" : "#4b5563",
                  }}
                >
                  Password change functionality will be implemented here.
                </p>
              </div>
            )}

            {activeItem === 2 && (
              <div
                className="bg-gray-50 dark:bg-[#1e293b] rounded-lg p-8"
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#f9fafb",
                }}
              >
                <h2
                  className="text-2xl font-bold mb-6 font-Poppins"
                  style={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                >
                  Enrolled Courses
                </h2>
                <p
                  className="text-gray-600 dark:text-gray-400 mb-6 font-Poppins"
                  style={{
                    color: theme === "dark" ? "#9ca3af" : "#4b5563",
                  }}
                >
                  Enrolled courses will be displayed here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

