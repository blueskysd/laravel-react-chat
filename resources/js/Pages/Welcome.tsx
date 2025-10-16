import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Chat App
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Connect with others through messaging
                        </p>
                    </div>

                    {auth.user ? (
                        <div className="space-y-4">
                            <p className="text-center text-gray-700">
                                Welcome back, {auth.user.name}!
                            </p>
                            <Link
                                href={route('dashboard')}
                                className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Link
                                href={route('login')}
                                className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                            >
                                Log In
                            </Link>
                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Register
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}