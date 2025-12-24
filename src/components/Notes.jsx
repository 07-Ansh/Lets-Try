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
    HardDrive,
    Share2,
    Image as ImageIcon,
    Folder,
    FolderPlus,
    Download,
    Edit2,
    CornerUpLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_COUNT = 500;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

import ConfirmationModal from './ConfirmationModal';
import InputModal from './InputModal';

export default function Notes() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('my-notes'); // 'my-notes' | 'community'
    const [myNotes, setMyNotes] = useState([]);
    const [folders, setFolders] = useState([]);
    const [communityNotes, setCommunityNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [showStickyUpload, setShowStickyUpload] = useState(false);
    const uploadCardRef = useRef(null);

    // Navigation State
    const [currentFolder, setCurrentFolder] = useState(null); // id of current folder
    const [folderPath, setFolderPath] = useState([]); // Array of folder objects {id, name}

    // Modal State
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null, // 'delete' | 'privacy'
        data: null
    });

    const [inputModal, setInputModal] = useState({
        isOpen: false,
        type: null, // 'create-folder' | 'rename'
        data: null, // If rename, the item object
        title: '',
        message: '',
        initialValue: ''
    });

    // Stats for Quota
    const totalSize = myNotes.reduce((acc, note) => acc + (note.size || 0), 0);
    const fileCount = myNotes.length;

    useEffect(() => {
        if (user) {
            fetchNotesAndFolders();
        }
    }, [user, activeTab]);

    // Observer for Sticky Button
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyUpload(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (uploadCardRef.current && activeTab === 'my-notes') {
            observer.observe(uploadCardRef.current);
        }

        return () => {
            if (uploadCardRef.current) observer.unobserve(uploadCardRef.current);
        };
    }, [myNotes, activeTab]);

    const fetchNotesAndFolders = async () => {
        setLoading(true);
        try {
            if (activeTab === 'my-notes') {
                const q = query(
                    collection(db, 'notes'),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Separate Folders and Files
                setFolders(allItems.filter(item => item.type === 'folder'));
                setMyNotes(allItems.filter(item => item.type !== 'folder'));
            } else {
                const q = query(
                    collection(db, 'notes'),
                    where("isPublic", "==", true)
                );
                const querySnapshot = await getDocs(q);
                const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // For community, we only show files, flattened or however desired. 
                // For simplified community view, filter out folders for now or treat them as viewable.
                // Current requirement is just lists. Let's filter out folders from community view for simplicity unless requested.
                const othersNotes = notes.filter(n => n.userId !== user.uid && n.type !== 'folder');
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

    // --- Actions ---

    const handleCreateFolderClick = () => {
        setInputModal({
            isOpen: true,
            type: 'create-folder',
            title: 'New Folder',
            message: 'Enter a name for your new folder.',
            initialValue: '',
            placeholder: 'Folder Name'
        });
    };

    const handleRenameClick = (item) => {
        setInputModal({
            isOpen: true,
            type: 'rename',
            data: item,
            title: 'Rename',
            message: `Enter a new name for "${item.title || item.name}"`,
            initialValue: item.title || item.name,
            placeholder: 'New Name'
        });
    };

    const handleInputConfirm = async (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        setInputModal({ ...inputModal, isOpen: false });

        try {
            if (inputModal.type === 'create-folder') {
                const newFolder = {
                    userId: user.uid,
                    title: trimmedValue,
                    type: 'folder',
                    parentId: currentFolder, // Current folder ID or null
                    createdAt: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'notes'), newFolder);
                setFolders(prev => [...prev, { id: docRef.id, ...newFolder }]);
            } else if (inputModal.type === 'rename') {
                const item = inputModal.data;
                await updateDoc(doc(db, 'notes', item.id), {
                    title: trimmedValue
                });

                // Update local state
                if (item.type === 'folder') {
                    setFolders(prev => prev.map(f => f.id === item.id ? { ...f, title: trimmedValue } : f));
                    // Update current path if we renamed a folder we are "inside" (though impossible from UI usually)
                    // or update path if we renamed a breadcrumb? (Not implementing complex path updates yet)
                } else {
                    setMyNotes(prev => prev.map(n => n.id === item.id ? { ...n, title: trimmedValue } : n));
                }
            }
        } catch (err) {
            console.error("Action failed:", err);
            alert("Action failed.");
        }
    };

    const handleNavigation = (folder) => {
        setFolderPath(prev => [...prev, folder]);
        setCurrentFolder(folder.id);
    };

    const handleNavigateUp = () => {
        if (folderPath.length === 0) return;
        const newPath = [...folderPath];
        newPath.pop(); // Remove current
        setFolderPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    };

    const handleNavigateToBreadcrumb = (index) => {
        if (index === -1) {
            setFolderPath([]);
            setCurrentFolder(null); // Home
        } else {
            const newPath = folderPath.slice(0, index + 1);
            setFolderPath(newPath);
            setCurrentFolder(newPath[newPath.length - 1].id);
        }
    };

    const handleDownload = async (note) => {
        try {
            // Fetch blob from proxy to avoid CORS/Browser issues if possible, or just direct link
            const response = await fetch(note.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = note.title; // Force download name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed, falling back to new tab:", err);
            window.open(note.url, '_blank');
        }
    };

    // --- Upload Logic ---

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

    const triggerUpload = () => {
        document.getElementById('file-upload').click();
    };

    const handleUpload = async (file) => {
        setError('');

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only PDF, JPEG, PNG, or WEBP files are allowed.');
            alert('Only PDF, JPEG, PNG, or WEBP files are allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 5MB allowed.`);
            return;
        }
        if (fileCount >= MAX_FILE_COUNT) {
            setError(`File limit reached.`);
            return;
        }
        if (totalSize + file.size > MAX_TOTAL_SIZE) {
            setError(`Storage limit reached.`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const uniqueName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `users/${user.uid}/notes/${uniqueName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(Math.round(progress));
                    },
                    reject,
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (err) { reject(err); }
                    }
                );
            }).then(async (downloadURL) => {
                const newNote = {
                    userId: user.uid,
                    userName: user.name || "Anonymous",
                    title: file.name,
                    fileName: uniqueName,
                    url: downloadURL,
                    size: file.size,
                    type: file.type,
                    isPublic: false,
                    parentId: currentFolder, // Save to current folder
                    createdAt: new Date().toISOString()
                };

                const docRef = await addDoc(collection(db, 'notes'), newNote);
                setMyNotes(prev => [({ id: docRef.id, ...newNote }), ...prev]);

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });

        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload file.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // --- Deletion & Privacy ---

    const handleDeleteClick = (note) => {
        setConfirmation({
            isOpen: true,
            type: 'delete',
            data: note
        });
    };

    const handlePrivacyClick = (note) => {
        if (!note.isPublic) {
            setConfirmation({
                isOpen: true,
                type: 'privacy',
                data: note
            });
        } else {
            executePrivacyToggle(note);
        }
    };

    const executeAction = async () => {
        if (!confirmation.data) return;
        if (confirmation.type === 'delete') await executeDelete(confirmation.data);
        else if (confirmation.type === 'privacy') await executePrivacyToggle(confirmation.data);
        setConfirmation({ ...confirmation, isOpen: false });
    };

    const executeDelete = async (item) => {
        try {
            if (item.type === 'folder') {
                // Recursive delete logic would go here. 
                // For now, prevent deleting non-empty folders or just delete the folder doc?
                // Let's just delete the folder document. 
                // Ideally, we check for children.
                const hasChildren = myNotes.some(n => n.parentId === item.id) || folders.some(f => f.parentId === item.id);
                if (hasChildren) {
                    alert("Folder is not empty. Please empty it first.");
                    return;
                }
                await deleteDoc(doc(db, 'notes', item.id));
                setFolders(prev => prev.filter(f => f.id !== item.id));
            } else {
                // Delete File
                const fileRef = ref(storage, `users/${user.uid}/notes/${item.fileName}`);
                await deleteObject(fileRef).catch(e => console.warn("File not found in storage", e));
                await deleteDoc(doc(db, 'notes', item.id));
                setMyNotes(prev => prev.filter(n => n.id !== item.id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete.");
        }
    };

    const executePrivacyToggle = async (note) => {
        try {
            const newStatus = !note.isPublic;
            await updateDoc(doc(db, 'notes', note.id), { isPublic: newStatus });
            setMyNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPublic: newStatus } : n));
        } catch (err) {
            alert("Failed to update privacy.");
        }
    };

    // --- Helpers ---
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const getFileIcon = (type) => {
        if (type === 'folder') return <Folder size={32} className="fill-yellow-400 text-yellow-600" />;
        if (type && type.startsWith('image/')) return <ImageIcon size={24} />;
        return <FileText size={24} />;
    };

    // Filter items for current view
    const getCurrentItems = () => {
        // Folders in current directory
        const currentFolders = folders.filter(f => f.parentId === currentFolder);
        // Files in current directory
        const currentFiles = myNotes.filter(n => n.parentId === currentFolder);
        return { currentFolders, currentFiles };
    };

    const { currentFolders, currentFiles } = getCurrentItems();

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={executeAction}
                title={confirmation.type === 'delete' ? "Delete Item?" : "Make Public?"}
                message={confirmation.type === 'delete'
                    ? `Are you sure you want to delete "${confirmation.data?.title}"?`
                    : `Are you sure you want to share "${confirmation.data?.title}"?`
                }
                confirmText={confirmation.type === 'delete' ? "Delete" : "Share"}
                isDanger={confirmation.type === 'delete'}
            />

            <InputModal
                isOpen={inputModal.isOpen}
                onClose={() => setInputModal({ ...inputModal, isOpen: false })}
                onConfirm={handleInputConfirm}
                title={inputModal.title}
                message={inputModal.message}
                initialValue={inputModal.initialValue}
                placeholder={inputModal.placeholder}
                confirmText="Save"
            />

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

                <div className="flex gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-sm">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-bold">{fileCount}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-gray-400" />
                        <span className="font-bold">{formatBytes(totalSize)}</span>
                    </div>
                </div>
            </div>

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
                        Community
                    </button>
                </div>

                <AnimatePresence>
                    {(showStickyUpload || myNotes.length < 8) && activeTab === 'my-notes' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-2"
                        >
                            <button
                                onClick={handleCreateFolderClick}
                                className="bg-gray-200 text-black w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                                title="New Folder"
                            >
                                <FolderPlus size={18} />
                                <span className="hidden md:inline">New Folder</span>
                            </button>
                            <button
                                onClick={triggerUpload}
                                className="bg-black text-white w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 transition-colors"
                                title="Upload"
                            >
                                <Upload size={18} />
                                <span className="hidden md:inline">Upload</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Breadcrumbs for My Notes */}
            {activeTab === 'my-notes' && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => handleNavigateToBreadcrumb(-1)}
                        className={`hover:text-black font-bold flex items-center gap-1 ${currentFolder === null ? 'text-black' : ''}`}
                    >
                        Home
                    </button>
                    {folderPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <span>/</span>
                            <button
                                onClick={() => handleNavigateToBreadcrumb(index)}
                                className={`hover:text-black font-bold whitespace-nowrap ${index === folderPath.length - 1 ? 'text-black' : ''}`}
                            >
                                {folder.title}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}

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
                                {currentFolder && (
                                    <button
                                        onClick={handleNavigateUp}
                                        className="bg-gray-100/50 p-6 rounded-2xl border border-gray-200 border-dashed hover:bg-gray-100 transition-all flex flex-col items-center justify-center text-gray-400 gap-2 min-h-[11rem] cursor-pointer"
                                    >
                                        <CornerUpLeft size={24} />
                                        <span className="font-bold text-sm">Back</span>
                                    </button>
                                )}

                                {/* RENDER FOLDERS */}
                                {currentFolders.map(folder => (
                                    <div
                                        key={folder.id}
                                        onClick={() => handleNavigation(folder)}
                                        className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-all group relative min-h-[11rem] flex flex-col cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                                                <Folder size={24} />
                                            </div>
                                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRenameClick(folder); }}
                                                    className="p-2 text-gray-400 hover:text-black rounded-lg"
                                                    title="Rename"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(folder); }}
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 truncate mt-auto">{folder.title}</h3>
                                        <p className="text-xs text-gray-400">Folder</p>
                                    </div>
                                ))}

                                {/* RENDER FILES */}
                                {currentFiles.map((note) => (
                                    <div key={note.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative min-h-[11rem] flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${note.type?.startsWith('image/') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                                                {getFileIcon(note.type)}
                                            </div>
                                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRenameClick(note)}
                                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg"
                                                    title="Rename"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrivacyClick(note)}
                                                    className={`p-2 rounded-lg ${note.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-black'}`}
                                                >
                                                    {note.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(note)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1 truncate" title={note.title}>{note.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                            <span>{formatBytes(note.size)}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                            <button
                                                onClick={() => handleDownload(note)}
                                                className="text-gray-400 hover:text-black flex items-center gap-1 text-xs font-bold transition-colors"
                                            >
                                                <Download size={14} /> Save
                                            </button>
                                            <a
                                                href={note.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm font-bold text-black hover:underline"
                                            >
                                                View <Eye size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {/* New Folder Card */}
                                <div
                                    onClick={handleCreateFolderClick}
                                    className="hidden md:flex bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex-col items-center justify-center text-center p-6 min-h-[11rem] cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <FolderPlus size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">New Folder</h3>
                                </div>

                                {/* Upload Card */}
                                <div
                                    ref={uploadCardRef}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerUpload}
                                    className={`hidden md:flex border-2 border-dashed rounded-2xl flex-col items-center justify-center text-center p-6 min-h-[11rem] cursor-pointer transition-all duration-200 ${dragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                                <Upload size={20} />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-sm">Upload Here</h3>
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
                                    <div key={note.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all h-56 flex flex-col">
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

                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => handleDownload(note)}
                                                className="flex-1 py-3 bg-gray-100 text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                            >
                                                <Download size={16} /> Save
                                            </button>
                                            <a
                                                href={note.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                                            >
                                                <Eye size={16} /> View
                                            </a>
                                        </div>
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
