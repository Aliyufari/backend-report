import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <Head title="Reset Password" />

            <AuthLayout title="Reset Password">
                <Form
                    {...NewPasswordController.store.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="flex flex-col gap-5"
                    onSuccess={() => toast.success('Password reset successfully!')}
                    onError={() => toast.error('Failed to reset password. Please try again.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <label htmlFor="email" className="block w-full mb-1">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    defaultValue={email}
                                    readOnly
                                    className="w-full py-2 px-4 border border-gray-200 rounded-md outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <label htmlFor="password" className="block w-full mb-1">New Password:</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoFocus
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

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>Reset Password</span>
                            </button>

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