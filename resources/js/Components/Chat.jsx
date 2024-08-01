import {useEffect, useRef, useState} from "react";
import {router, useForm} from "@inertiajs/react";

export default function Chat({users, currentUser, messages}) {
    /**
     * Listen Laravel reverb
     */
    window.Echo.private(`laravel-reverb.${currentUser.id}`)
        .listen('SendMessage', (event) => {
            setChatMessages((prev) => [...prev, event.message])
            setChatMessages((prev) => [...new Set(prev)])
        })


    const {data, setData, post, processing, errors, reset} = useForm({
        message: '',
        receiver_id: null,
    });

    const [chatMessages, setChatMessages] = useState(messages)
    const [activeUserId, setActiveUserId] = useState(0)
    const messagesEndRef = useRef(null)

    const fetchMessages = async (userId) => {
        router.visit(route().current() + `?userId=${userId}`, {
            only: ['messages'],
            preserveState: true,
            preserveScroll: true,
        })
    }

    const scrollToBottom = () => {
        messagesEndRef?.current?.scrollIntoView({behavior: "smooth", block: "end"})
    }

    const sendMessage = (e) => {
        e.preventDefault();
        post(route('messages.store'));
        setChatMessages((prev) => [...prev, {
            id: 1,
            message: data.message,
            sender_id: currentUser.id,
            sender: currentUser
        }])
        setData('message', '')
    };

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages]);

    useEffect(() => {
        setChatMessages(messages)
    }, [messages]);

    return (
        <div className="flex antialiased text-gray-800" style={{height: "80vh"}}>
            <div className="flex flex-row h-full w-full overflow-x-hidden">
                <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
                    <div className="flex flex-row items-center justify-center h-12 w-full">
                        <div
                            className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                ></path>
                            </svg>
                        </div>
                        <div className="ml-2 font-bold text-2xl">QuickChat</div>
                    </div>
                    <div
                        className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg"
                    >
                        <div className="h-20 w-20 rounded-full border overflow-hidden">
                            <img
                                src="https://avatars3.githubusercontent.com/u/2763884?s=128"
                                alt="Avatar"
                                className="h-full w-full"
                            />
                        </div>
                        <div className="text-sm font-semibold mt-2">{currentUser.name}</div>
                        {/*<div className="text-xs text-gray-500">Lead UI/UX Designer</div>*/}
                        <div className="flex flex-row items-center mt-3">
                            <div
                                className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full"
                            >
                                <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                            </div>
                            <div className="leading-none ml-1 text-xs">Active</div>
                        </div>
                    </div>
                    <div className="flex flex-col mt-8">
                        <div className="flex flex-row items-center justify-between text-xs">
                            <span className="font-bold">Active Conversations</span>
                            <span
                                className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full"
                            >
                                {users.length}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                            {users.map(user => (
                                <button
                                    onClick={() => {
                                        setData('receiver_id', user.id)
                                        setActiveUserId(user.id)
                                        fetchMessages(user.id)
                                    }}
                                    key={user.id}
                                    className={`${"flex flex-row items-center rounded-xl p-2"} ${activeUserId === user.id ? 'bg-gray-500 text-white' : ''}`}
                                >
                                    <div
                                        className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full"
                                    >
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="ml-2 text-sm font-semibold">{user.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-auto h-full p-6">
                    {
                        activeUserId ? (
                            <div
                                className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
                            >
                                <div className="flex flex-col h-full overflow-x-auto mb-4">
                                    <div className="flex flex-col h-full">
                                        <div className="grid grid-cols-12 gap-y-2">
                                            {
                                                chatMessages.map((message, index) => (
                                                    message.sender_id === currentUser.id ? (
                                                        <div
                                                            key={index}
                                                            className="col-start-6 col-end-13 p-3 rounded-lg">
                                                            <div
                                                                className="flex items-center justify-start flex-row-reverse">
                                                                <div
                                                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                                                >
                                                                    {message.sender.name.charAt(0)}
                                                                </div>
                                                                <div
                                                                    className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                                                                >
                                                                    <div>{message.message}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            key={index}
                                                            className="col-start-1 col-end-8 p-3 rounded-lg">
                                                            <div className="flex flex-row items-center">
                                                                <div
                                                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                                                >
                                                                    {message.sender.name.charAt(0)}
                                                                </div>
                                                                <div
                                                                    className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                                                >
                                                                    <div>{message.message}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                ))
                                            }
                                            <div ref={messagesEndRef}/>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
                                >
                                    <div>
                                        <button
                                            className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex-grow ml-4">
                                        <div className="relative w-full">
                                            <input
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                type="text"
                                                className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                                            />
                                            <button
                                                className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    ></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <button
                                            onClick={sendMessage}
                                            disabled={!data.message}
                                            className={"flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"}
                                        >
                                            <span>Send</span>
                                            <span className="ml-2">
                  <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
                            >
                                <center className="font-bold text-2xl">No Active Chat</center>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
