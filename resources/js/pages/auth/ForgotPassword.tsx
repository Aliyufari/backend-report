import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/AuthLayout';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { toast } from 'react-toastify';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot Password" />

            <AuthLayout
                title="Forgot Password"
                description="Enter your email address and we'll send you a password reset link."
            >
                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <Form
                    {...PasswordResetLinkController.store.form()}
                    className="flex flex-col gap-5"
                    onSuccess={() => toast.success('Reset link sent! Check your email.')}
                    onError={() => toast.error('Something went wrong. Please try again.')}
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
                                    autoComplete="off"
                                    placeholder="johndoe@email.com"
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>Send Reset Link</span>
                            </button>

                            <p className="text-center">
                                Remembered your password?{' '}
                                <Link href={login()} className="text-primary underline underline-offset-2">Log in</Link>
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