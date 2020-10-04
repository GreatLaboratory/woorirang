import admin from 'firebase-admin';
import firebaseAccount from './firebase.json';

const serviceAccount: any = firebaseAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: '',
}); 

export const notificationOption = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
};

export default admin;
