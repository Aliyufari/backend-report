import InputError from '@/components/input-error';
import Spinner from '../components/Spinner';
import AuthLayout from '@/layouts/AuthLayout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Confirm Password" />

            <AuthLayout
                title="Confirm Password"
                description="This is a secure area. Please confirm your password before continuing."
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                    onSuccess={() => toast.success('Password confirmed!')}
                    onError={() => toast.error('Incorrect password. Please try again.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <label htmlFor="password" className="block w-full mb-1">Password:</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoFocus
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

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing && <Spinner />}
                                <span>Confirm Password</span>
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