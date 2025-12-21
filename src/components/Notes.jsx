import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { db, storage } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    orderBy
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import {
    Upload,
    FileText,
    Trash2,
    Lock,
    Unlock,
    Eye,
    Loader2,
    AlertCircle,
    HardDrive,
    Share2,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_COUNT = 500;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export default function Notes() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('my-notes'); // 'my-notes' | 'community'
    const [myNotes, setMyNotes] = useState([]);
    const [communityNotes, setCommunityNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [showStickyUpload, setShowStickyUpload] = useState(false);
    const uploadCardRef = useRef(null);

    // Stats for Quota
    const totalSize = myNotes.reduce((acc, note) => acc + (note.size || 0), 0);
    const fileCount = myNotes.length;

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user, activeTab]);

    // Observer for Sticky Button
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyUpload(!entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1,
                rootMargin: "0px"
            }
        );

        if (uploadCardRef.current && activeTab === 'my-notes') {
            observer.observe(uploadCardRef.current);
        }

        return () => {
            if (uploadCardRef.current) observer.unobserve(uploadCardRef.current);
        };
    }, [myNotes, activeTab]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            if (activeTab === 'my-notes') {
                const q = query(
                    collection(db, 'notes'),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort client-side
                notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setMyNotes(notes);
            } else {
                const q = query(
                    collection(db, 'notes'),
                    where("isPublic", "==", true)
                );
                const querySnapshot = await getDocs(q);
                const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const othersNotes = notes.filter(n => n.userId !== user.uid);
                othersNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setCommunityNotes(othersNotes);
            }
        } catch (err) {
            console.error("Error fetching notes:", err);
            setError("Failed to load notes.");
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    // Trigger hidden input
    const triggerUpload = () => {
        document.getElementById('file-upload').click();
    };

    const handleUpload = async (file) => {
        setError('');

        // 1. Validation
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only PDF, JPEG, PNG, or WEBP files are allowed.');
            alert('Only PDF, JPEG, PNG, or WEBP files are allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 5MB allowed.`);
            alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 5MB allowed.`);
            return;
        }
        if (fileCount >= MAX_FILE_COUNT) {
            setError(`File limit reached (${MAX_FILE_COUNT} files). Delete some files to upload more.`);
            alert(`File limit reached.`);
            return;
        }
        if (totalSize + file.size > MAX_TOTAL_SIZE) {
            setError(`Storage limit reached (${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(0)}MB). Delete some files to upload more.`);
            alert('Storage limit reached.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // 2. Upload to Storage with Progress
            const uniqueName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `users/${user.uid}/notes/${uniqueName}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            // Wrap in promise to handle completion/error
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(Math.round(progress));
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (err) {
                            reject(err);
                        }
                    }
                );
            }).then(async (downloadURL) => {
                // 3. Save Metadata to Firestore
                const newNote = {
                    userId: user.uid,
                    userName: user.name || "Anonymous",
                    title: file.name,
                    fileName: uniqueName,
                    url: downloadURL,
                    size: file.size,
                    type: file.type,
                    isPublic: false, // Private by default
                    createdAt: new Date().toISOString()
                };

                const docRef = await addDoc(collection(db, 'notes'), newNote);

                // 4. Update UI
                setMyNotes(prev => [({ id: docRef.id, ...newNote }), ...prev]);

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });

        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload file. Please try again.");
            alert("Upload failed. see console.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (note) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            // Delete from Storage
            const fileRef = ref(storage, `users/${user.uid}/notes/${note.fileName}`);
            await deleteObject(fileRef).catch(e => console.warn("File not found in storage, deleting metadata only.", e));

            // Delete from Firestore
            await deleteDoc(doc(db, 'notes', note.id));

            // Update UI
            setMyNotes(prev => prev.filter(n => n.id !== note.id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete note.");
        }
    };

    const togglePrivacy = async (note) => {
        try {
            const newStatus = !note.isPublic;
            await updateDoc(doc(db, 'notes', note.id), {
                isPublic: newStatus
            });

            setMyNotes(prev => prev.map(n =>
                n.id === note.id ? { ...n, isPublic: newStatus } : n
            ));
        } catch (err) {
            console.error("Failed to update privacy:", err);
            alert("Failed to update privacy settings.");
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type && type.startsWith('image/')) {
            return <ImageIcon size={24} />;
        }
        return <FileText size={24} />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Global Hidden Input */}
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf, .jpg, .jpeg, .png, .webp"
                onChange={handleFileSelect}
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Study Material</h1>
                    <p className="text-gray-500 mt-2">Store your notes and resources or share them with others.</p>
                </div>

                {/* Quota Stats */}
                <div className="flex gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-sm">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-bold">{fileCount}</span>
                        <span className="text-gray-400">/ {MAX_FILE_COUNT} Files</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-gray-400" />
                        <span className="font-bold">{formatBytes(totalSize)}</span>
                        <span className="text-gray-400">/ {formatBytes(MAX_TOTAL_SIZE)}</span>
                    </div>
                </div>
            </div>

            {/* Sticky Header with Tabs & Action */}
            <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur py-4 flex items-center justify-between border-b border-transparent transition-all">
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('my-notes')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'my-notes' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'community' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Community Notes
                    </button>
                </div>

                <AnimatePresence>
                    {showStickyUpload && activeTab === 'my-notes' && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={triggerUpload}
                            className="bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-colors"
                        >
                            <Upload size={18} />
                            Upload
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'my-notes' && (
                    <motion.div
                        key="my-notes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Loading notes...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Notes Rendering */}
                                {myNotes.map((note) => (
                                    <div key={note.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative aspect-square flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${note.type?.startsWith('image/') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                                                {getFileIcon(note.type)}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => togglePrivacy(note)}
                                                    className={`p-2 rounded-lg transition-colors ${note.isPublic ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={note.isPublic ? "Publicly Shared" : "Private"}
                                                >
                                                    {note.isPublic ? <Unlock size={18} /> : <Lock size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(note)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1 truncate" title={note.title}>{note.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                                            <span>{formatBytes(note.size)}</span>
                                            <span>•</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${note.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {note.isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <a
                                                href={note.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm font-bold text-black hover:underline"
                                            >
                                                View <Eye size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {/* Inline Upload Card */}
                                <div
                                    ref={uploadCardRef}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerUpload}
                                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 aspect-square cursor-pointer transition-all duration-200 ${dragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-4 w-full">
                                            <div className="w-full flex items-center justify-between text-xs font-bold uppercase text-gray-400 mb-1">
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-black rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                                <Upload size={24} />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Upload New</h3>
                                            <p className="text-xs text-gray-400 mt-1">PDF or Image</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'community' && (
                    <motion.div
                        key="community"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Loading community notes...</div>
                        ) : communityNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {communityNotes.map((note) => (
                                    <div key={note.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all aspect-square flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${note.type?.startsWith('image/') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                                                {getFileIcon(note.type)}
                                            </div>
                                            <div className="p-2 text-gray-400">
                                                <Share2 size={18} />
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1 truncate" title={note.title}>{note.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                            <span>by {note.userName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                                            <span>{formatBytes(note.size)}</span>
                                            <span>•</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <a
                                            href={note.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full mt-auto py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                                        >
                                            <Eye size={16} /> View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400 italic">
                                No shared notes found. Share yours to get started!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
