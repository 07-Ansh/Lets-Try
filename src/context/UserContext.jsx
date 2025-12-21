import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // 1. Set basic user immediately to unblock UI
                setUser(prev => ({
                    ...prev,
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || prev?.name || "Loading...",
                    username: prev?.username || "User",
                    gender: prev?.gender || "male",
                    history: prev?.history || [],
                    ...currentUser
                }));

                // 2. Fetch full profile in background
                getDoc(doc(db, "users", currentUser.uid))
                    .then(async (userDoc) => {
                        if (userDoc.exists()) {
                            setUser(prev => ({ ...prev, ...userDoc.data() }));
                        } else {
                            // Self-healing: Create missing profile if it doesn't exist
                            console.warn("UserProvider: Profile missing, creating default.");
                            const defaultProfile = {
                                name: currentUser.displayName || "New User",
                                username: currentUser.email?.split('@')[0] || "user",
                                gender: "male",
                                email: currentUser.email,
                                createdAt: new Date().toISOString(),
                                history: []
                            };
                            await setDoc(doc(db, "users", currentUser.uid), defaultProfile);
                            setUser(prev => ({ ...prev, ...defaultProfile }));
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching/creating user profile:", error);
                    });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Keep safety timeout just in case
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 4000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const signup = async (userData) => {
        try {
            // 1. Create Auth User
            const { user: authUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

            // 2. Create Firestore Profile
            const userProfile = {
                name: userData.name,
                username: userData.username,
                gender: userData.gender,
                email: userData.email,
                createdAt: new Date().toISOString(),
                history: []
            };

            await setDoc(doc(db, "users", authUser.uid), userProfile);

            // Update local state immediately with profile data
            setUser({ ...authUser, ...userProfile });

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if profile exists, if not create it
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                const defaultProfile = {
                    name: user.displayName,
                    username: user.email.split('@')[0],
                    gender: "male", // Default
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    history: []
                };
                await setDoc(doc(db, "users", user.uid), defaultProfile);
                setUser({ ...user, ...defaultProfile });
            } else {
                setUser({ ...user, ...userDoc.data() });
            }
            return { success: true };
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const lastHistoryUpdate = React.useRef(0);

    const updateUserHistory = async (score, total, topic, details = []) => {
        if (!user || !user.uid) return;

        // THROTTLE: Prevent multiple updates within 2 seconds
        const now = Date.now();
        if (now - lastHistoryUpdate.current < 2000) {
            console.log("History update throttled (preventing duplicate)");
            return;
        }
        lastHistoryUpdate.current = now;

        const percentage = Math.round((score / total) * 100);

        const newEntry = {
            score,
            total,
            percentage,
            topic,
            details,
            date: new Date().toISOString()
        };

        try {
            // Update Firestore
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                history: arrayUnion(newEntry)
            });

            // Update Local State for immediate UI reflection
            setUser(prev => ({
                ...prev,
                history: [...(prev.history || []), newEntry]
            }));

        } catch (error) {
            console.error("Failed to save history", error);
        }
    };

    const deleteHistoryItem = async (indexToDelete) => {
        if (!user || !user.uid) return;

        try {
            // 1. Create new history array locally
            // The history is stored in chronological order (oldest first) in the DB typically if we just append
            // But verify: arrayUnion appends.
            // LOCAL state might be needed to be careful.
            // Let's assume user.history is the source of truth.

            // Wait, standard array removal by index in Firestore is hard because 'arrayRemove' needs the EXACT object.
            // Since we don't have unique IDs for history items, we might have issues if there are identical items.
            // Strategy: We have to read the WHOLE array, modify it, and write it back.
            // 'updateDoc' with the full array is safer for deletion by index.

            const newHistory = user.history.filter((_, index) => index !== indexToDelete);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                history: newHistory
            });

            setUser(prev => ({
                ...prev,
                history: newHistory
            }));

            return { success: true };
        } catch (error) {
            console.error("Failed to delete history item", error);
            return { success: false, message: error.message };
        }
    };

    const updateUserProfile = async (updates) => {
        if (!user || !user.uid) return { success: false, message: "No user logged in" };

        try {
            const userRef = doc(db, "users", user.uid);

            // Use setDoc with merge: true to create if missing, avoid updateDoc hang on missing docs
            // Also race with a timeout to prevent infinite hanging
            await Promise.race([
                setDoc(userRef, updates, { merge: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Save timed out - Check connection")), 10000))
            ]);

            // Update local state
            setUser(prev => ({ ...prev, ...updates }));
            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            // Handle specific "Save timed out" or network errors
            return { success: false, message: error.message || "Failed to update profile" };
        }
    };

    const value = React.useMemo(() => ({
        user, loading, login, signup, logout, loginWithGoogle, updateUserHistory, updateUserProfile, deleteHistoryItem
    }), [user, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
