import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Log in" />

            <AuthLayout title="Welcome Back">
                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <Form
                    {...AuthenticatedSessionController.store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                    onSuccess={() => toast.success('Logged in successfully!')}
                    onError={() => toast.error('Login failed. Please check your credentials.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <label htmlFor="email" className="block w-full mb-1">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="johndoe@email.com"
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password">Password:</label>
                                    {canResetPassword && (
                                        <Link href={request()} className="text-xs text-primary underline underline-offset-2">
                                            Forgot Password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="xxxxxxxx"
                                        className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer text-gray-400">
                                        {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" name="remember" className="w-4 h-4 accent-primary cursor-pointer" />
                                <label htmlFor="remember" className="cursor-pointer">Remember me</label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>Login</span>
                            </button>

                            <p className="text-center">
                                Don't have an account?{' '}
                                <Link href={register()} className="text-primary underline underline-offset-2">Sign up</Link>
                            </p>

                            <p className="text-center text-zinc-400 text-xs">
                                &copy; {new Date().getFullYear()} All Rights Reserved.
                            </p>
                        </>
                    )}
                </Form>
            </AuthLayout>
        </>
    );
}