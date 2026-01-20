import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";

import { makePostRequest } from "../utils/api";
import { getLoggedInUser } from "../utils/auth";
import { notifySuccess, notifyError } from "../utils/toast";

import { Schemas } from "../validation/index";
import { FormikForm } from "../components/forms/FormikForm";
import FormButton from "../components/FormButton";

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (values) => {
        try {
            const response = await makePostRequest("/auth/login", values);

            const token = response.data.token;
            localStorage.setItem("jwtToken", token);

            notifySuccess("Login successful!");

            const user = getLoggedInUser();
            if (user) navigate("/dashboard", { replace: true });
        } catch (error) {
            let message = "Invalid email or password";

            if (error.response?.data?.detail) {
                message = error.response.data.detail;
            }

            notifyError(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0f2e] via-[#2d1b4e] to-[#1a0f2e] p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                        <h2 className="text-white font-bold">Logo</h2>
                    </div>
                    <h1 className="text-white text-3xl mb-2 font-bold">Welcome Back</h1>
                    <p className="text-white/60">Sign in to continue to your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <FormikForm
                        initialValues={{ email: "", password: "" }}
                        validationSchema={Schemas.login}
                        onSubmit={handleSubmit}
                    >
                        {(formik) => (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm mb-2 text-gray-700 font-medium">Email</label>
                                    <div className="relative">
                                        <Mail
                                            size={20}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        />
                                    </div>

                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 text-gray-700 font-medium">Password</label>

                                    <div className="relative">
                                        <Lock
                                            size={20}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Enter your password"
                                            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.password}
                                        </p>
                                    )}
                                </div>

                                <FormButton isLoading={formik.isSubmitting}>
                                    Login
                                </FormButton>
                            </div>
                        )}
                    </FormikForm>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="text-sm text-gray-700">Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-sm text-gray-700">Facebook</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don&apos;t have an account?{' '}
                        <button className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
