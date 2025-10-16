import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/outline'
import { v4 as uuidv4 } from 'uuid';

interface Message {
    id: number;
    content: string;
    created_at: string;
    is_sender: boolean;
    read_at: string | null;
    is_deleted?: boolean;
    is_reported?: boolean;
    status?: string;
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
    // local copy so polling can update the list
    const [messagesState, setMessagesState] = useState<Message[]>(messages)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesState]);

    useEffect(() => {
        setMessagesState(messages)
    }, [selectedUser.id, messages])

    useEffect(() => {
        const id = setInterval(fetchMessages, 10_000)
        return () => clearInterval(id)
    }, [selectedUser.id]) // restart when switching person

    //only scroll if new message added
    const prevCountRef = useRef<number>(messagesState.length)
    useEffect(() => {
        if (messagesState.length > prevCountRef.current) {
            scrollToBottom()
        }
        prevCountRef.current = messagesState.length
    }, [messagesState])

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('messages.store'), {
            preserveScroll: true,
            headers: {
                'Idempotency-Key': uuidv4(),
            },
            onSuccess: () => reset('content'),
        });
    };

    const fetchMessages = async () => {
        try {
            // If you registered a named route like Route::get('/api/chat/{user}/messages'...)->name('chat.fetch')
            // const res = await fetch(route('chat.fetch', selectedUser.id), { headers: { Accept: 'application/json' } })

            // Or a plain URL endpoint:
            const res = await fetch(`/api/chat/${selectedUser.id}/messages`, {
                headers: { Accept: 'application/json' },
            })
            if (!res.ok) throw new Error('Network error')
            const data = await res.json() as { messages: Message[] }
            setMessagesState(data.messages)
        } catch (e) {
            console.error('Polling failed', e)
        }
    }

    const deleteMessage = (messageId: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(route('messages.destroy', messageId), {
                preserveScroll: true,
            });
        }
    };
    const reportMessage = (messageId: number) => {
        if (confirm('Are you sure you want to report this message to a moderator?')) {
            router.post(route('messages.report', messageId), {}, { preserveScroll: true });
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
    const groupedMessages = messagesState.reduce(
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
                                                                    {!message.is_sender ? (
                                                                        message.is_deleted || message.is_reported ? (
                                                                            // spacer keeps layout even when hidden
                                                                            <div className="mt-2 w-4 h-4" />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => reportMessage(message.id)}
                                                                                className="mt-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                                                title="Report message"
                                                                            >
                                                                                <FlagIcon className="h-4 w-4 text-amber-500 hover:text-amber-700" />
                                                                            </button>
                                                                        )
                                                                    ) : null}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div
                                                                            className={`rounded-lg px-4 py-2 ${
                                                                                message.is_deleted
                                                                                    ? message.is_sender
                                                                                        ? 'bg-gray-300 text-gray-600'
                                                                                        : 'bg-gray-200 text-gray-600'
                                                                                    : message.status === 'reported'
                                                                                      ? message.is_sender
                                                                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                                                          : 'bg-gray-200 text-gray-600'
                                                                                      : message.is_sender
                                                                                        ? 'bg-blue-600 text-white'
                                                                                        : 'bg-gray-100 text-gray-900'
                                                                            }`}
                                                                        >
                                                                            <p
                                                                                className={`break-words ${
                                                                                    message.is_deleted ||
                                                                                    (message.status ===
                                                                                        'reported' &&
                                                                                        !message.is_sender)
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
                                                                                        : message.status ===
                                                                                            'reported'
                                                                                          ? message.is_sender
                                                                                              ? 'text-amber-700'
                                                                                              : 'text-gray-500'
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
                                                                            message.status ===
                                                                                'reported' && (
                                                                                <div className="flex items-center gap-1 px-2 text-xs text-amber-700">
                                                                                    <svg
                                                                                        className="h-3 w-3"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth="2"
                                                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                                                        />
                                                                                    </svg>
                                                                                    <span>
                                                                                        [Reported: pending moderation]
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                    {message.is_sender ? (
                                                                        message.is_deleted ? (
                                                                            // spacer to keep layout aligned when delete button is hidden
                                                                            <div className="mt-2 w-4 h-4" />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => deleteMessage(message.id)}
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
                                                                        )
                                                                    ) : null}
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
