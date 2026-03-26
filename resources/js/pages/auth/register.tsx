import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/AuthLayout';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <Head title="Register" />

            <AuthLayout title="Register to Get Started" maxWidth="max-w-[500px]">
                <Form
                    {...RegisteredUserController.store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-5"
                    onSuccess={() => toast.success('Account created successfully!')}
                    onError={() => toast.error('Registration failed. Please check your details.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name" className="block w-full mb-1">Full Name:</label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className="w-full py-2 px-4 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <label htmlFor="username" className="block w-full mb-1">Username:</label>
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                        autoComplete="username"
                                        placeholder="johndoe"
                                        className="w-full py-2 px-4 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                    />
                                    <InputError message={errors.username} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block w-full mb-1">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="johndoe@email.com"
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="password" className="block w-full mb-1">Password:</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="xxxxxxxx"
                                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                        />
                                        <span onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer text-gray-400">
                                            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                                        </span>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block w-full mb-1">Confirm Password:</label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="xxxxxxxx"
                                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                        />
                                        <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer text-gray-400">
                                            {showConfirmPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                                        </span>
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>Register</span>
                            </button>

                            <p className="text-center">
                                Already have an account?{' '}
                                <Link href={login()} className="text-primary underline underline-offset-2">Login</Link>
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