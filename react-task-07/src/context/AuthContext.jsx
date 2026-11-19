import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';

const AuthContext = createContext(null);

// Firebase errors have a code like "auth/invalid-credential". Turn the common
// ones into messages a person can read.
const ERROR_MESSAGES = {
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/invalid-email': 'This email address is not valid.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'The password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'auth/popup-closed-by-user': 'The Google window was closed before signing in.',
    'auth/popup-blocked': 'The browser blocked the Google window. Allow pop-ups and try again.',
    'auth/unauthorized-domain': 'This site is not allowed to use Google sign-in yet.',
};

function toReadableError(error) {
    return new Error(ERROR_MESSAGES[error.code] ?? 'Something went wrong. Please try again.');
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // true until Firebase says whether someone is signed in (it restores the saved session on page load)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Called once on load, then after every sign-in and sign-out.
        // It returns a function that stops listening, which is our cleanup.
        return onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
    }, []);

    // The functions below do not set `user` themselves: onAuthStateChanged does it.
    // On failure they throw an Error with a readable message for the page to show.

    async function signup(email, password) {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw toReadableError(error);
        }
    }

    async function login(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw toReadableError(error);
        }
    }

    async function loginWithGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            throw toReadableError(error);
        }
    }

    function logout() {
        return signOut(auth);
    }

    const value = { user, loading, signup, login, loginWithGoogle, logout };

    // React 19: the context itself works as the provider.
    return <AuthContext value={value}>{children}</AuthContext>;
}

// Any component inside <AuthProvider> can call useAuth() to get the user and the functions above.
export function useAuth() {
    return useContext(AuthContext);
}
