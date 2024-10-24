import { Store, registerInDevtools } from 'pullstate'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth'
import { ref, set, get } from "firebase/database";
import { app, auth, database } from '../firebase'

export const AuthStore = new Store({
    isLoggedIn: false,
    initialized: false,
    user: null,
    name: null,
})

export const unsub = onAuthStateChanged(auth, async (user) => {
    console.log('onAuthStateChange', user);
    if (user !== null) {
        const snapshot = await get(ref(database, "users/" + user?.uid + '/username'));
        AuthStore.update((store) => {
            store.user = user;
            store.isLoggedIn = user ? true : false;
            store.initialized = true;
            store.name = snapshot.val()
        })
    } else {
        AuthStore.update((store) => {
            store.isLoggedIn = false;
            store.initialized = true;
        })
    }
})

export const appSignIn = async (email, password) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password)
        const snapshot = await get(ref(database, "users/" + res.user?.uid + '/username'));
        AuthStore.update((store) => {
            store.user = res.user;
            store.initialized = true
            store.name = snapshot.val()
        })
        return { user: auth.currentUser }
    } catch (error) {
        console.log(error);
        return { error: error }
    }
}

export const appSignOut = async () => {
    try {
        await signOut(auth);
        AuthStore.update((store) => {
            store.user = null;
            store.name = null;
            store.isLoggedIn = false
        })
        return { user: null }
    } catch (error) {
        return { error: error }
    }
}

export const appSignUp = async (email, password, username, phone) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password)

        set(ref(database, "users/" + res.user?.uid), {
            email: email,
            username: username,
            phonenumber: phone
        });

        AuthStore.update((store) => {
            store.user = auth.currentUser;
            store.isLoggedIn = true;
            store.name = username
        });

        return { user: auth.currentUser }
    } catch (error) {
        return { error: error }
    }
}