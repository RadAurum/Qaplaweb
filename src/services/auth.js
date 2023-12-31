import { onAuthStateChanged, signInWithCustomToken, User, UserCredential, NextOrObserver } from 'firebase/auth';

import { createUserProfile, getUserProfileWithTwitchId, updateUserProfile } from './database';
import { auth } from './firebase';
import { generateAuthTokenForTwitchSignIn } from './functions';

/**
 * Listen to changes on the firebase auth state
 * @param {NextOrObserver<User>} callback Handler of auth state changes
 */
export function listenToAuthState(callback) {
    onAuthStateChanged(auth, callback);
}

/**
 * Sign a user on firebase with Twitch auth information
 * @param {object} userTwitchId Twitch id of the user
 * @returns {Promise<UserCredential>} Firebase auth user credential
 */
export async function signTwitchUser(userTwitchId) {
    const userProfileSnapshot = await getUserProfileWithTwitchId(userTwitchId);
    let userProfile = null;

    userProfileSnapshot.forEach((profile) => userProfile = profile.val());

    // If there is a profile and have an id field use that field, otherwise (new user) use Twitch id
    const qaplaCustomAuthToken = await generateAuthTokenForTwitchSignIn(userProfile.id ? userProfile.id : userTwitchId);

    if (qaplaCustomAuthToken.data && qaplaCustomAuthToken.data.token) {
        const user = await signInWithCustomToken(auth, qaplaCustomAuthToken.data.token);

        // Overwrite of isNewUser and photoURL is necessary
        return { ...user.user, isNewUser: !userProfileSnapshot.exists() };
    }
}

export async function authWithTwitch(userTwitchId, onSuccess) {
    const user = await signTwitchUser(userTwitchId);

    if (user.isNewUser) {
        // For a new user their uid and userName are the same than their twitch id and twitch display name
        await createUserProfile(user.uid, user.email, user.displayName, user.photoURL, user.uid, user.displayName);
    } else {
        await updateUserProfile(user.uid, {
            email: user.email,
            userName: user.displayName,
            photoUrl: user.photoURL
        });
    }

    onSuccess(user);
}