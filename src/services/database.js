import {
    child,
    DataSnapshot,
    equalTo,
    get,
    orderByChild,
    push,
    query,
    runTransaction,
    ThenableReference,
    TransactionResult,
    update,
    onValue,
    set,
    orderByValue
} from 'firebase/database';

import { database } from './firebase';

//////////////////////
// Qapla Users
//////////////////////

/**
 * Returns the found uid´s linked to the given Twitch id (it returns an object of objects but we know that
 * the relationship between uid and Twitch id is 1:1)
 * @param {string} twitchId Twitch identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getUserProfileWithTwitchId(twitchId) {
    const usersChild = child(database, '/Users');

    return await get(query(usersChild, orderByChild('twitchId'), equalTo(twitchId)));
}

/**
 * Listen for changes on the given user profile
 * @param {string} uid User identifier
 * @param {DataSnapshot} callback Handler for the database results
 */
export function listenToUserProfile(uid, callback) {
    const userChild = child(database, `/Users/${uid}`);
    return onValue(query(userChild), callback);
}

/**
 * Returns the profile of the given user
 * @param {string} uid User identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getUserProfile(uid) {
    const userChild = child(database, `/Users/${uid}`);

    return await get(query(userChild));
}

/**
 * Creates the basic Qapla profile for the given user
 * @param {string} uid User identifier
 * @param {string} email Email
 * @param {string} userName Qapla username
 * @param {string} photoUrl Qapla photo url
 * @param {string} twitchId Twitch identifier
 * @param {string} twitchUsername Twitch username
 */
export async function createUserProfile(uid, email, userName, photoUrl, twitchId, twitchUsername) {
    let city = userName.toUpperCase();

    const profileObj = {
        bio: '',
        city,
        credits: 0,
        email,
        id: uid,
        level: 0,
        status: false,
        token: '',
        userName,
        isUserLoggedOut: false,
        photoUrl,
        twitchId,
        twitchUsername,
        language: 'en' // i18 value
    };

    const userChild = child(database, `/Users/${uid}`);

    await update(userChild, profileObj);
}

/**
 * Update the given fields on the user profile
 * @param {string} uid User identifier
 * @param {object} dateToUpdate Data to update
 * @param {object} dateToUpdate.email Email
 * @param {object} dateToUpdate.userName Qapla username
 * @param {object} dateToUpdate.photoUrl Qapla photo url
 * @param {object} dateToUpdate.twitchUsername Twitch username
 */
export async function updateUserProfile(uid, dateToUpdate) {
    const userChild = child(database, `/Users/${uid}`);

    await update(userChild, dateToUpdate);
}

/**
 * Remove the amount of Qoins from the given user credits node
 * @param {string} uid User identifier
 * @param {number} qoinsToRemove Qoins to remove from the user
 * @returns {Promise<TransactionResult>} Result of the transaction
 */
export async function removeQoinsFromUser(uid, qoinsToRemove) {
    const userQoinsChild = child(database, `/Users/${uid}/credits`);

    return await runTransaction(userQoinsChild, (userQoins) => {
        if (userQoins && userQoins >= qoinsToRemove) {
            userQoins -= qoinsToRemove;
        }

        return userQoins >= 0 ? userQoins : 0;
    });
}

//////////////////////
// Reactions count
//////////////////////

/**
 * Listen for changes on the given user profile
 * @param {string} uid User identifier
 * @param {string} streamerUid Streamer user identifier
 * @param {DataSnapshot} callback Handler for the database results
 */
export function listenUserReactionsWithStreamer(uid, streamerUid, callback) {
    const reactionsCountChild = child(database, `/UsersReactionsCount/${uid}/${streamerUid}`);

    return onValue(query(reactionsCountChild), callback);
}

/**
 * Returns the count of prepaid reactions the user have with the given streamer
 * @param {string} uid User identifier
 * @param {string} streamerUid Streamer user identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getUserReactionsWithStreamer(uid, streamerUid) {
    const reactionsCountChild = child(database, `/UsersReactionsCount/${uid}/${streamerUid}`);

    return await get(query(reactionsCountChild));
}

//////////////////////
// User Streamer
//////////////////////

/**
 * Add the amount of Qoins to the given streamer Qoins balance
 * @param {string} streamerUid Streamer identifier
 * @param {number} qoinsToAdd Qoins to add to the streamer
 * @returns {Promise<TransactionResult>} Result of the transaction
 */
export async function addQoinsToStreamer(streamerUid, qoinsToAdd) {
    const userStreamerChild = child(database, `/UserStreamer/${streamerUid}/qoinsBalance`);

    return await runTransaction(userStreamerChild, (streamerQoinsBalance) => {
        if (streamerQoinsBalance) {
            streamerQoinsBalance += qoinsToAdd;
        }

        return streamerQoinsBalance ? streamerQoinsBalance : qoinsToAdd;
    });
}

/**
 * Returns the number of followers of the given streamer public profile
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getStreamerFollowersNumber(streamerUid) {
    const userStreamerChild = child(database, `/UserStreamer/${streamerUid}/followers`);

    return await get(query(userStreamerChild));
}

//////////////////////
// Streamer Public Data
//////////////////////

/**
 * Returns the public information of the given streamer
 * @param {string} streamerUid Stremer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getStreamerPublicData(streamerUid) {
    const streamerPublicDataChild = child(database, `/UserStreamerPublicData/${streamerUid}`);

    return await get(query(streamerPublicDataChild));
}

/**
 * Returns only the isStreaming of the given streamer
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnaphsot of the query
 */
export async function getStreamerIsStreaming(streamerUid) {
    const streamerIsStreamingChild = child(database, `/UserStreamerPublicData/${streamerUid}/isStreaming`);

    return await get(query(streamerIsStreamingChild));
}

//////////////////////
// Streamer Public Profile
//////////////////////

/**
 * Returns the public profile of the given streamer
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnaphsot of the query
 */
export async function getStreamerPublicProfile(streamerUid) {
    const streamerProfileChild = child(database, `/StreamersPublicProfiles/${streamerUid}`);

    return await get(query(streamerProfileChild));
}

//////////////////////
// Streamer Links
//////////////////////

/**
 * Returns all the (social) links of the given streamer
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnaphsot of the query
 */
export async function getStreamerLinks(streamerUid) {
    const streamerLinksChild = child(database, `/StreamerLinks/${streamerUid}`);

    return await get(query(streamerLinksChild));
}

//////////////////////
// Streamer Alerts Settings
//////////////////////

/**
 * Returns the reactionsEnabled setting value of the given streamer (used to know if the Qapla overlay is
 * enabled or not)
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function streamerHasReactionsEnabled(streamerUid) {
    const streamerReactionsEnabledChild = child(database, `/StreamerAlertsSettings/${streamerUid}/reactionsEnabled`);

    return await get(query(streamerReactionsEnabledChild));
}

//////////////////////
// Voice Bot Available Voices
//////////////////////

/**
 * Returns the list of available voices for the voice bot
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getBotVoices() {
    const voiceBotAvailableVoicesChild = child(database, 'VoiceBotAvailableVoices');

    return await get(query(voiceBotAvailableVoicesChild));
}

//////////////////////
// Qoins Reactions
//////////////////////

/**
 * Store cheers on the database at StreamersDonations node and remove Qoins
 * @param {string} uid User identifier
 * @param {number} amountQoins Amount of donated Qoins
 * @param {string} streamerUid Streamer uid
 * @param {object | null} media Object for cheers with specified media
 * @param {string} media.type Type of media (one of "GIF", "EMOTE" or "MEME")
 * @param {string} media.url Url of the media
 * @param {string} message Message from the user
 * @param {object | null} messageExtraData Extra data for the message
 * @param {string} messageExtraData.voiceAPIName Google Text to speech API voice for the voice bot
 * @param {object} messageExtraData.giphyText Object with Giphy Text data
 * @param {Object | undefined} messageExtraData.giphyText Giphy text object
 * @param {Array<string>} emojis Emojis for emoji rain
 * @param {string} streamerName Name of the streamer
 * @param {string} userName Qapla username
 * @param {string} twitchUserName Username of Twitch
 * @param {string} userPhotoURL URL of the user profile photo
 * @param {function} onSuccess Function to call once the cheer is sent
 * @param {function} onError Function to call on any possible error
 */
export async function sendQoinsReaction(uid, amountQoins, streamerUid, media, message, messageExtraData, emojis, streamerName, userName, twitchUserName, userPhotoURL, onSuccess, onError) {
    const userQoinsChild = child(database, `/Users/${uid}/credits`);
    const qoinsUpdated = await removeQoinsFromUser(uid, amountQoins);

    if (qoinsUpdated.committed) {
        const streamerBalanceUpdated = await addQoinsToStreamer(streamerUid, amountQoins);

        if (streamerBalanceUpdated.committed) {
            const streamerDonationsChild = child(database, `/StreamersDonations/${streamerUid}`);
            const timestamp = (new Date()).getTime();

            const donationRef = push(streamerDonationsChild, {
                amountQoins,
                media,
                message,
                messageExtraData,
                emojiRain: {
                    emojis,
                },
                timestamp,
                uid,
                read: false,
                twitchUserName,
                userName,
                photoURL: userPhotoURL,
                pointsChannelInteractions: false
            });

            const userDonationsAmountChild = child(database, `/UsersRewardsProgress/${uid}/donations/qoins`);

            await runTransaction(userDonationsAmountChild, (totalDonatedQoins) => {
                return totalDonatedQoins ? (totalDonatedQoins + amountQoins) : amountQoins
            });

            const donationsAdministrativeChild = child(database, `/StreamersDonationAdministrative/${donationRef.key}`);
            await push(donationsAdministrativeChild, {
                amountQoins,
                message,
                timestamp,
                uid,
                sent: false,
                twitchUserName,
                userName,
                streamerName,
                pointsChannelInteractions: false
            });

            return onSuccess();
        } else {
            // If we can not give the Qoins to the streamer then return the Qoins to the user
            await runTransaction(userQoinsChild, (userQoins) => {
                if (userQoins) {
                    userQoins += amountQoins;
                }

                return userQoins >= 0 ? userQoins : 0;
            });

            return onError();
        }
    } else {
        // Could not remove Qoins from the user
        return onError();
    }
}

//////////////////////
// Prepaid Reactions
//////////////////////

/**
 * Store cheers on the database at StreamersDonations node and remove prepaid reaction (and Qoins if necessary)
 * @param {string} uid User identifier
 * @param {string} userName Qapla username
 * @param {string} twitchUserName Username of Twitch
 * @param {string} userPhotoURL URL of the user profile photo
 * @param {string} streamerUid Streamer uid
 * @param {string} streamerName Name of the streamer
 * @param {object | null} media Object for cheers with specified media
 * @param {string} media.type Type of media (one of "GIF", "EMOTE" or "MEME")
 * @param {string} media.url Url of the media
 * @param {string} message Message from the user
 * @param {object | null} messageExtraData Extra data for the message
 * @param {string} messageExtraData.voiceAPIName Google Text to speech API voice for the voice bot
 * @param {boolean} messageExtraData.isGiphyText True if contains giphy Text
 * @param {Object | undefined} messageExtraData.giphyText Giphy text object
 * @param {Object} emojiRain Emoji/Emote data for rain
 * @param {("emoji" | "emote")} emojiRain.type Type of rain (emoji or emote)
 * @param {Array<string>} emojiRain.emojis Array of strings with emojis (as text) or emotes (as urls)
 * @param {number} qoinsToRemove Amount of donated Qoins
 * @param {function} onSuccess Function to call once the cheer is sent
 * @param {function} onError Function to call on any possible error
 */
export async function sendPrepaidReaction(uid, userName, twitchUserName, userPhotoURL, streamerUid, streamerName, media, message, messageExtraData, emojiRain, qoinsToRemove, removePrepaidDonation, onSuccess, onError) {
    let qoinsTaken = qoinsToRemove ? false : true;

    if (qoinsToRemove) {
        qoinsTaken = (await removeQoinsFromUser(uid, qoinsToRemove)).committed;

        if (qoinsTaken) {
            addQoinsToStreamer(streamerUid, qoinsToRemove)
        }
    }

    if (qoinsTaken) {
        const reactionsCountChild = child(database, `/UsersReactionsCount/${uid}/${streamerUid}`);

        let reactionTaken = {};
        if (removePrepaidDonation) {
            reactionTaken = await runTransaction(reactionsCountChild, (reactionsCount) => {
                return reactionsCount - 1;
            });
        }

        if (!removePrepaidDonation || reactionTaken.committed) {
            const streamerDonationsChild = child(database, `/StreamersDonations/${streamerUid}`);
            const timestamp = (new Date()).getTime();

            const donationRef = push(streamerDonationsChild, {
                amountQoins: qoinsToRemove,
                media,
                message,
                messageExtraData,
                emojiRain,
                timestamp,
                uid,
                read: false,
                twitchUserName,
                userName,
                photoURL: userPhotoURL,
                pointsChannelInteractions: true
            });

            if (qoinsToRemove) {
                const userDonationsAmountChild = child(database, `/UsersRewardsProgress/${uid}/donations/qoins`);

                await runTransaction(userDonationsAmountChild, (totalDonatedQoins) => {
                    return totalDonatedQoins ? (totalDonatedQoins + qoinsToRemove) : qoinsToRemove
                });
            }

            const donationsAdministrativeChild = child(database, `/StreamersDonationAdministrative/${donationRef.key}`);
            await set(donationsAdministrativeChild, {
                amountQoins: qoinsToRemove,
                message,
                timestamp,
                uid,
                sent: false,
                twitchUserName,
                userName,
                streamerName,
                pointsChannelInteractions: true
            });

            return onSuccess();
        } else {
            // If we can not remove the reaction from the count

            // Give back Qoins to user
            const userQoinsChild = child(database, `/Users/${uid}/credits`);
            await runTransaction(userQoinsChild, (userQoins) => {
                return userQoins ? (userQoins + qoinsToRemove) : qoinsToRemove;
            });

            // Remove Qoins from streamer
            const userStreamerChild = child(database, `/UserStreamer/${streamerUid}/qoinsBalance`);
            await runTransaction(userStreamerChild, (streamerQoinsBalance) => {
                if (streamerQoinsBalance) {
                    streamerQoinsBalance -= qoinsToRemove;
                }

                return streamerQoinsBalance ? (streamerQoinsBalance - qoinsToRemove) : 0;
            });

            return onError();
        }
    }
}

//////////////////////
// Reactions Costs
//////////////////////

/**
 * Returns all the reaction types with their costs in Qoins
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getReactionsCosts() {
    const reactionsCostsChild = child(database, '/InteractionsCosts');

    return await get(query(reactionsCostsChild));
}

/**
 * Returns the specified reaction types with their cost in Qoins
 * @param {string} reactionType Type of reaction to load
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getReactionTypeCost(reactionType) {
    const reactionsCostsChild = child(database, `/InteractionsCosts/${reactionType}`);

    return await get(query(reactionsCostsChild));
}

//////////////////////
// Reractions Sample
//////////////////////

/**
 * Gets the length of reactions samples for the given type
 * @param {string} type Type of reaction to get sample
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getReactionsSamplesCount(type) {
    const reactionsSamplesLength = child(database, `/ReactionsSamples/${type}/length`);

    return await get(query(reactionsSamplesLength));
}

/**
 * Gets the specified (by the index) reaction sample
 * @param {string} type Type of reaction to get sample
 * @param {number} index Index of the sample to get
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getReactionSample(type, index) {
    const reactionsSample = child(database, `/ReactionsSamples/${type}/samples/${index}`);

    return await get(query(reactionsSample));
}

//////////////////////
// Qapla Reactions
//////////////////////

/**
 * Returns the Qapla library of memes
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getQaplaMemesLibrary() {
    const memesLibrary = child(database, `/QaplaInteractions/Memes`);

    return await get(query(memesLibrary));
}

//////////////////////
// In App Purchases Products
//////////////////////

/**
 * Gets the information about Qoins to be bought on this web page
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getQoinsPackages() {
    const qoinsPackages = child(database, '/inAppPurchasesProducts/web');

    return await get(query(qoinsPackages));
}

//////////////////////
// User Reactions Queue
//////////////////////

/**
 * Saves a reaction in the user Queue so it can be sent later (after a successful purchase of Qoins for example)
 * @param {string} uid User identifier
 * @param {string} streamerUid Streamer identifier
 * @param {object} reaction Reaction object
 * @returns {ThenableReference} Combined Promise and Reference; resolves when write is complete, but can be used immediately as the Reference to the child location
 */
export function putReactionInQueue(uid, streamerUid, reaction) {
    const userReactionQueue = child(database, `/UsersReactionsQueue/${uid}/${streamerUid}`);

    return push(userReactionQueue, reaction);
}

//////////////////////
// Qreators Codes
//////////////////////

/**
 * Returns all the streamer id´s who match the Qreator code (it will be only one streamer id but the query returns an objec of objects)
 * @param {string} qreatorCode Desired Streamer Qreator code
 * @returns {Promise<DataSnapshot>} Resulting DataSnapshot of the query
 */
export async function getStreamerUidWithQreatorCode(qreatorCode) {
    const qreatorCodeRef = child(database, `/QreatorsCodes`);

    return await get(query(qreatorCodeRef, orderByChild('codeLowerCase'), equalTo(qreatorCode.toLowerCase())));
}

//////////////////////
// Streams
//////////////////////

/**
 * Returns all the published streams of the given streamer
 * @param {string} streamerUid Streamer identifier
 * @returns {Promise<DataSnapshot>} Resulting DataSnaphsot of the query
 */
export async function getStreamerStreams(streamerUid) {
    const streamerStreams = child(database, `/eventosEspeciales/eventsData`);

    return await get(query(streamerStreams, orderByChild('idStreamer'), equalTo(streamerUid)));
}

//////////////////////
// Gifs
//////////////////////

/**
 * Returns the Gifs library
 * @returns {Array<Object>} Resulting Objects of the query
 */

export async function getReactionModuleGifs() {
    const gifsRef = child(database, '/Gifs/ReactionModule');

    return await get(query(gifsRef));
}

//////////////////////
// Streamers Deep Links
//////////////////////

/**
 * Find a streamer by using their branch deep link alias
 * (Branch alias are unique so this query will return always 0 or 1 result at most)
 * @param {string} linkAlias Branch deep link alias
 * @returns {Promise<DataSnapshot>} Resulting DataSnaphsot of the query
 */
export async function getStreamerUidWithDeepLinkAlias(linkAlias) {
    const streamersDeepLinksRef = child(database, '/StreamersDeepLinks');

    return await get(query(streamersDeepLinksRef, orderByValue(), equalTo(`https://myqap.la/${linkAlias}`)));
}