import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';

interface Message {
    id: number;
    content: string;
    created_at: string;
    is_sender: boolean;
    read_at: string | null;
    is_deleted?: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    selectedUser: User;
    messages: Message[];
    users: User[];
}

export default function Show({ selectedUser, messages, users }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, reset, processing } = useForm({
        receiver_id: selectedUser.id,
        content: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('content'),
        });
    };

    const deleteMessage = (messageId: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(route('messages.destroy', messageId), {
                preserveScroll: true,
            });
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce(
        (groups, message) => {
            const date = new Date(message.created_at).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
            return groups;
        },
        {} as Record<string, Message[]>,
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('chat.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Back
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Chat with {selectedUser.name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Chat with ${selectedUser.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex h-[600px] flex-col">
                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {Object.keys(groupedMessages).length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedMessages).map(
                                            ([date, msgs]) => (
                                                <div key={date}>
                                                    {/* Date separator */}
                                                    <div className="mb-4 flex items-center justify-center">
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                                            {formatDate(
                                                                msgs[0]
                                                                    .created_at,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Messages for this date */}
                                                    <div className="space-y-3">
                                                        {msgs.map((message) => (
                                                            <div
                                                                key={message.id}
                                                                className={`group flex ${
                                                                    message.is_sender
                                                                        ? 'justify-end'
                                                                        : 'justify-start'
                                                                }`}
                                                            >
                                                                <div className="flex max-w-[70%] items-start gap-2">
                                                                    <div
                                                                        className={`rounded-lg px-4 py-2 ${
                                                                            message.is_deleted
                                                                                ? message.is_sender
                                                                                    ? 'bg-gray-300 text-gray-600'
                                                                                    : 'bg-gray-200 text-gray-600'
                                                                                : message.is_sender
                                                                                  ? 'bg-blue-600 text-white'
                                                                                  : 'bg-gray-100 text-gray-900'
                                                                        }`}
                                                                    >
                                                                        <p
                                                                            className={`break-words ${
                                                                                message.is_deleted
                                                                                    ? 'italic'
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            {
                                                                                message.content
                                                                            }
                                                                        </p>
                                                                        <p
                                                                            className={`mt-1 text-xs ${
                                                                                message.is_deleted
                                                                                    ? 'text-gray-500'
                                                                                    : message.is_sender
                                                                                      ? 'text-blue-100'
                                                                                      : 'text-gray-500'
                                                                            }`}
                                                                        >
                                                                            {formatTime(
                                                                                message.created_at,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    {message.is_sender &&
                                                                        !message.is_deleted && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    deleteMessage(
                                                                                        message.id,
                                                                                    )
                                                                                }
                                                                                className="mt-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                                                title="Delete message"
                                                                            >
                                                                                <svg
                                                                                    className="h-4 w-4 text-red-500 hover:text-red-700"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message input */}
                            <div className="border-t border-gray-200 p-4">
                                <form onSubmit={submit} className="flex gap-2">
                                    <TextInput
                                        id="content"
                                        type="text"
                                        value={data.content}
                                        onChange={(e) =>
                                            setData('content', e.target.value)
                                        }
                                        className="flex-1"
                                        placeholder="Type your message..."
                                        autoComplete="off"
                                    />
                                    <PrimaryButton
                                        disabled={
                                            processing || !data.content.trim()
                                        }
                                    >
                                        Send
                                    </PrimaryButton>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}