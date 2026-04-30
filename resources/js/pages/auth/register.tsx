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
                    options={{
                        preserveState: true,
                        preserveScroll: true,
                        replace: true
                    }}
                    className="flex flex-col gap-5"
                    onSuccess={() => {
                        toast.success('Account created successfully!');
                    }}
                    onError={() => {
                        toast.error('Registration failed. Please check your details.');
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Name + Username */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block mb-1 text-sm font-medium text-foreground"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className="w-full py-2.5 px-4 border border-border rounded-lg bg-background
                                            outline-none transition-all duration-200
                                            focus:border-primary focus:ring-2 focus:ring-primary/15"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block mb-1 text-sm font-medium text-foreground"
                                    >
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                        autoComplete="username"
                                        placeholder="johndoe"
                                        className="w-full py-2.5 px-4 border border-border rounded-lg bg-background
                                            outline-none transition-all duration-200
                                            focus:border-primary focus:ring-2 focus:ring-primary/15"
                                    />
                                    <InputError message={errors.username} />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-1 text-sm font-medium text-foreground"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="johndoe@email.com"
                                    className="w-full py-2.5 px-4 border border-border rounded-lg bg-background
                                        outline-none transition-all duration-200
                                        focus:border-primary focus:ring-2 focus:ring-primary/15"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-1 text-sm font-medium text-foreground"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="w-full py-2.5 pl-4 pr-11 border border-border rounded-lg bg-background
                                                outline-none transition-all duration-200
                                                focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2
                                                text-muted-foreground hover:text-foreground
                                                transition-colors cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeClosed size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block mb-1 text-sm font-medium text-foreground"
                                    >
                                        Confirm Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="w-full py-2.5 pl-4 pr-11 border border-border rounded-lg bg-background
                                                outline-none transition-all duration-200
                                                focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword((prev) => !prev)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2
                                                text-muted-foreground hover:text-foreground
                                                transition-colors cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeClosed size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-primary/90 text-white
                                    py-2.5 px-4 rounded-lg transition-all duration-200
                                    flex justify-center items-center gap-2
                                    cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing && <Spinner />}
                                <span>
                                    {processing ? 'Creating Account...' : 'Register'}
                                </span>
                            </button>

                            {/* Footer */}
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href={login()}
                                    className="text-primary font-medium underline underline-offset-2"
                                >
                                    Login
                                </Link>
                            </p>

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