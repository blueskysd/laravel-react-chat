import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    last_message: {
        content: string;
        created_at: string;
        is_sender: boolean;
    } | null;
    unread_count: number;
}

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Messages
                </h2>
            }
        >
            <Head title="Chat" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Conversations
                            </h3>

                            {users.length === 0 ? (
                                <p className="text-gray-500">
                                    No users available to chat with.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {users.map((user) => (
                                        <Link
                                            key={user.id}
                                            href={route('chat.show', user.id)}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">
                                                        {user.name}
                                                    </h4>
                                                    {user.last_message && (
                                                        <span className="text-sm text-gray-500">
                                                            {formatTime(
                                                                user
                                                                    .last_message
                                                                    .created_at,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <p className="text-sm text-gray-600">
                                                        {user.last_message ? (
                                                            <>
                                                                {user
                                                                    .last_message
                                                                    .is_sender &&
                                                                    'You: '}
                                                                {user.last_message.content.substring(
                                                                    0,
                                                                    50,
                                                                )}
                                                                {user
                                                                    .last_message
                                                                    .content
                                                                    .length >
                                                                    50 && '...'}
                                                            </>
                                                        ) : (
                                                            <span className="italic">
                                                                No messages yet
                                                            </span>
                                                        )}
                                                    </p>
                                                    {user.unread_count > 0 && (
                                                        <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                                                            {user.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}