import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { db, storage } from '../firebase';
import {
    collection, addDoc, query, orderBy, onSnapshot,
    where, serverTimestamp, getDocs, setDoc, doc, getDoc, deleteDoc, Timestamp, increment, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, ArrowLeft, Search, User, MessageCircle, Trash2, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Chat({ onBack }) {
    const { user } = useUser();

    // UI State
    const [activeChat, setActiveChat] = useState(null); // The user/chat object we are talking to
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Data State
    const [chats, setChats] = useState([]); // List of active conversations
    const [messages, setMessages] = useState([]); // Messages in active chat

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null); // New error state

    const [chatListError, setChatListError] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // Upload loading state

    // Input State
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef();
    const fileInputRef = useRef(null); // Ref for file input

    // 1. Fetch User's Chats (Sidebar List)
    useEffect(() => {
        if (!user) return;

        // Listen to chats where current user is a participant
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => {
                const data = doc.data();
                // Determine the "other" user
                const otherUser = data.users?.find(u => u.uid !== user.uid) || { name: 'Unknown', uid: 'unknown' };
                return {
                    id: doc.id,
                    ...data,
                    otherUser // Helper for UI
                };
            });
            setChats(fetchedChats);
            setChatListError(null); // Clear error on success
        }, (error) => {
            console.error("Error fetching chats (Likely missing index):", error);
            setChatListError(error.message);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Fetch Messages for Active Chat
    useEffect(() => {
        if (!activeChat) return;

        const chatId = getChatId(user.uid, activeChat.uid);
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const msgs = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(msg => {
                    // Ephemeral Logic: Filter out if expired
                    if (msg.expiresAt) {
                        const expiry = msg.expiresAt.toDate();
                        if (now > expiry) return false;
                    }
                    return true;
                });
            setMessages(msgs);
            setShowMobileChat(true);
        });

        return () => unsubscribe();
    }, [activeChat, user]);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Helper: Generate consistent Chat ID (uid1_uid2 sorted)
    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    // Search for Users
    const handleSearch = async (e) => {
        e.preventDefault();
        setError(null);
        console.log("Starting search for:", searchTerm);
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef);

            console.log("Fetching users...");
            const snapshot = await getDocs(q);
            console.log("Users fetched:", snapshot.size);

            const term = searchTerm.toLowerCase();

            const results = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(u =>
                    u.uid !== user.uid &&
                    (
                        (u.username?.toLowerCase()?.includes(term)) ||
                        (u.name?.toLowerCase()?.includes(term)) ||
                        (u.email?.toLowerCase()?.includes(term))
                    )
                );

            console.log("Matches found:", results.length);
            setSearchResults(results);
        } catch (err) {
            console.error("Search failed:", err);
            setError(err.message);
        }
        setIsSearching(false);
    };

    // Start a Chat (Select User)
    const handleSelectUser = async (selectedUser) => {
        setSearchTerm(''); // Clear search
        setSearchResults([]);
        setIsSearching(false);
        setError(null); // Clear any search errors

        setActiveChat(selectedUser);
        setShowMobileChat(true);

        // Ensure Chat Document Exists
        const chatId = getChatId(user.uid, selectedUser.uid);
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            // Create new chat
            await setDoc(chatRef, {
                participants: [user.uid, selectedUser.uid],
                users: [
                    { uid: user.uid, name: user.name, username: user.username, photoURL: user.photoURL || null },
                    { uid: selectedUser.uid, name: selectedUser.name, username: selectedUser.username, photoURL: selectedUser.photoURL || null }
                ],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: { text: "Chat started", senderId: "system", createdAt: new Date() },
                unreadCounts: { [user.uid]: 0, [selectedUser.uid]: 0 }
            });
        } else {
            // Mark as read (reset unread count for current user)
            await updateDoc(chatRef, {
                [`unreadCounts.${user.uid}`]: 0
            });
        }
    };



    // Handle File Upload
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat) return;

        setIsUploading(true);
        const chatId = getChatId(user.uid, activeChat.uid);

        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `chat-media/${chatId}/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Calculate Expiry (24 hours from now)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            // 3. Send Message with Media Metadata
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: "", // Empty text for media messages
                mediaUrl: downloadURL,
                mediaType: file.type.startsWith('image/') ? 'image' : 'file',
                mediaName: file.name,
                expiresAt: Timestamp.fromDate(expiresAt),
                createdAt: serverTimestamp(),
                senderId: user.uid,
                senderName: user.name
            });

            // 4. Update Chat Metadata & Unread Count
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: {
                    text: file.type.startsWith('image/') ? '📷 Image' : 'Cc File',
                    senderId: user.uid,
                    createdAt: new Date()
                },
                updatedAt: serverTimestamp(),
                [`unreadCounts.${activeChat.uid}`]: increment(1)
            });

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to send file: " + error.message);
        }
        setIsUploading(false);
        e.target.value = null; // Reset input
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !user) return;

        const chatId = getChatId(user.uid, activeChat.uid);
        const text = newMessage.trim();
        setNewMessage(''); // Clear UI immediately

        try {
            // 1. Add Message
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: text,
                createdAt: serverTimestamp(),
                senderId: user.uid,
                senderName: user.name
            });

            // 2. Update Chat Metadata (for sidebar list)
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: {
                    text: text,
                    senderId: user.uid,
                    createdAt: new Date() // Client time for immediate update, server will overwrite if needed
                },
                updatedAt: serverTimestamp(),
                [`unreadCounts.${activeChat.uid}`]: increment(1)
            });

        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    // Delete Message
    const handleDeleteMessage = async (messageId) => {
        if (!activeChat) return;
        const chatId = getChatId(user.uid, activeChat.uid);

        try {
            await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
            alert("Failed to delete message.");
        }
    };

    // Delete Chat
    const handleDeleteChat = async () => {
        if (!activeChat || !window.confirm("Are you sure you want to delete this chat permanently?")) return;

        const chatId = getChatId(user.uid, activeChat.uid);
        try {
            await deleteDoc(doc(db, 'chats', chatId));
            setActiveChat(null);
            setShowMobileChat(false);
        } catch (error) {
            console.error("Error deleting chat:", error);
            alert("Failed to delete chat.");
        }
    };

    return (
        <div className="flex w-full h-full md:h-[calc(100vh-73px)] bg-white border-t border-gray-100">

            {/* LEFT SIDEBAR: User List / Search */}
            <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-gray-100 bg-gray-50/50`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">Chats</h2>
                    </div>
                    {/* Optional: Add New Chat Icon if needed */}
                </div>

                {/* Search */}
                <div className="p-4 bg-white border-b border-gray-100">
                    <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search username/email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-1 focus:ring-black text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            <Search size={18} />
                        </button>
                    </form>
                    {error && (
                        <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 break-words">
                            Search Error: {error}
                        </div>
                    )}
                    {chatListError && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 break-words">
                            <strong>Sidebar Error:</strong> {chatListError.includes('index') ? 'Missing Index' : chatListError}
                            <br />
                            <span className="opacity-75">Check console (F12) for the link to fix it.</span>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {/* SEARCH RESULTS */}
                    {searchTerm && (
                        <div className="mb-4">
                            <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Search Results</h3>
                            {searchResults.length === 0 && !isSearching ? (
                                <p className="px-4 text-sm text-gray-500">No users found.</p>
                            ) : (
                                searchResults.map(u => (
                                    <button
                                        key={u.uid}
                                        onClick={() => handleSelectUser(u)}
                                        className="w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-50 text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{u.name}</h4>
                                            <p className="text-xs text-gray-500">@{u.username}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* RECENT CHATS */}
                    {!searchTerm && (
                        <>
                            {chats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-6">
                                    <MessageCircle size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">No conversations yet.</p>
                                    <p className="text-xs mt-1">Search for a username above to start chatting!</p>
                                </div>
                            ) : (
                                chats.map(chat => {
                                    const unreadCount = chat.unreadCounts?.[user.uid] || 0;
                                    const hasUnread = unreadCount > 0;

                                    return (
                                        <button
                                            key={chat.id}
                                            onClick={() => handleSelectUser(chat.otherUser)}
                                            className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-50 text-left ${activeChat?.uid === chat.otherUser.uid ? 'bg-white border-l-4 border-l-black' : ''}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-600 relative ${hasUnread ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200 bg-gray-100'}`}>
                                                <span className={`font-bold text-lg ${hasUnread ? 'text-green-700' : ''}`}>{chat.otherUser.name?.[0]?.toUpperCase()}</span>
                                                {hasUnread && (
                                                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white translate-x-1 -translate-y-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`font-bold text-gray-900 truncate ${hasUnread ? 'text-black' : ''}`}>{chat.otherUser.name}</h4>
                                                    <span className={`text-[10px] ${hasUnread ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                                        {chat.updatedAt?.seconds ? new Date(chat.updatedAt.seconds * 1000).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate max-w-[85%] ${hasUnread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                        {chat.lastMessage?.senderId === user.uid ? 'You: ' : ''}{chat.lastMessage?.text}
                                                    </p>
                                                    {hasUnread && (
                                                        <span className="flex items-center justify-center bg-green-500 text-white text-[9px] font-bold rounded-full h-5 min-w-[20px] px-1">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* RIGHT MAIN: Chat Window */}
            <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} w-full flex-col bg-white relative`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10 sticky top-0">
                            <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                {activeChat.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                                <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteChat}
                                className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Chat"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === user.uid;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative leading-relaxed ${isMe
                                            ? 'bg-black text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                            }`}>
                                            <div className="flex items-start justify-between gap-2 group/msg">
                                                <div className="flex-1">
                                                    {msg.mediaUrl ? (
                                                        <div className="mb-1">
                                                            {msg.mediaType === 'image' ? (
                                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img
                                                                        src={msg.mediaUrl}
                                                                        alt="Shared"
                                                                        className="rounded-lg max-w-full max-h-[200px] object-cover border border-black/10"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href={msg.mediaUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/10' : 'bg-black/5'} hover:opacity-80 transition-opacity`}
                                                                >
                                                                    <FileText size={20} />
                                                                    <span className="underline truncate max-w-[150px]">{msg.mediaName || 'File'}</span>
                                                                </a>
                                                            )}
                                                            <div className="text-[10px] mt-1 opacity-75 flex items-center gap-1">
                                                                ⏳ Expires in 24h
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>{msg.text}</p>
                                                    )}
                                                </div>
                                                {isMe && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="opacity-0 group-hover/msg:opacity-100 p-1 text-red-400 hover:text-red-500 transition-opacity"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className={`text-[10px] text-right mt-1 opacity-60 ${isMe ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,application/pdf"
                            />

                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                                    title="Attach File (24h expiry)"
                                >
                                    {isUploading ? <span className="text-xs font-bold animate-pulse">...</span> : <Paperclip size={20} />}
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 py-3 px-5 bg-gray-50 border-transparent focus:bg-white focus:border-black rounded-full transition-all focus:ring-0"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Your Messages</h3>
                        <p className="text-sm mt-2 max-w-xs text-center">Select a chat from the left or search for a user to start a conversation.</p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Chat;
