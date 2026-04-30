import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/AuthLayout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
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
            <Head title="Log In" />

            <AuthLayout title="Welcome Back">
                {status && (
                    <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <Form
                    {...AuthenticatedSessionController.store.form()}
                    resetOnSuccess={['password']}
                    disableWhileProcessing
                    options={{
                        preserveState: true,
                        preserveScroll: true,
                        replace: true
                    }}
                    className="flex flex-col gap-5"
                    onSuccess={() => {
                        toast.success('Logged in successfully!');
                    }}
                    onError={() => {
                        toast.error('Login failed. Please check your credentials.');
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1 block text-sm font-medium text-foreground"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="johndoe@email.com"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary"
                                />

                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Password
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-xs font-medium text-primary underline underline-offset-2"
                                        >
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
                                        placeholder="Enter your password"
                                        className="w-full rounded-lg border border-border bg-background py-2.5 pl-4 pr-11 outline-none transition-colors focus:border-primary"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                <InputError message={errors.password} />
                            </div>

                            {/* Remember */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                                />

                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-foreground"
                                >
                                    Remember me
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>
                                    {processing ? 'Logging in...' : 'Login'}
                                </span>
                            </button>

                            {/* Register */}
                            <p className="text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={register()}
                                    className="font-medium text-primary underline underline-offset-2"
                                >
                                    Sign up
                                </Link>
                            </p>

                            {/* Footer */}
                            <p className="text-center text-xs text-muted-foreground">
                                &copy; {new Date().getFullYear()} All Rights Reserved.
                            </p>
                        </>
                    )}
                </Form>
            </AuthLayout>
        </>
    );
}