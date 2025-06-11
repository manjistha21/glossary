"use client";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";
import IconLockDots from "@/components/icon/icon-lock-dots";
import IconMail from "@/components/icon/icon-mail";

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Authentication successful, set local storage
      localStorage.setItem("auth", "true");
      router.push("/addpage");
    } else {
      // Authentication failed
      setError(data.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-10 shadow-lg">
        <div className="mb-4 mt-2 flex justify-center">
          <img src="/assets/images/logo.png" alt="Logo" className="h-20" />
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          SIGN IN
        </h2>
        <form className="space-y-5" onSubmit={submitForm}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              User Name
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                id="username"
                type="text"
                placeholder="Enter Username"
                className="form-input block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IconMail fill={true} />
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                className="form-input block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IconLockDots fill={true} />
              </span>
            </div>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            className="btn btn-gradient mt-6 w-full rounded-md border-0 bg-gradient-to-r from-purple-500 to-pink-500 py-2 font-bold uppercase text-white shadow-lg"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComponentsAuthLoginForm;
