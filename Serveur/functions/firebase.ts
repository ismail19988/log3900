import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { uuidv4 } from "../utils/uuidV4";

var serviceAccount = require("./log3900-102-firebase-adminsdk-d2nov-febec60184.json");

const firebaseApp = initializeApp({
    apiKey: "AIzaSyDnDc1WBFpuEXkVfqCbnYNdHac0HnNFwck",
    authDomain: "log3900-102.firebaseapp.com",
    projectId: "log3900-102",
    storageBucket: "log3900-102.appspot.com",
    messagingSenderId: "651095380030",
    appId: "1:651095380030:web:1f7a2fa94a5384abda816f",
    measurementId: "G-PXF2CEH2GW"
});

export const uploadFile = async (email: string, buffer: any) => {

    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, email + ".jpg");
    const token = uuidv4();

    const metadata = {
        metadata: {
            firebaseStorageDownloadTokens: token,
        },
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
    };

    return await uploadBytes(storageRef, buffer, metadata)
    .then((snapshot: any) => {
        return "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/" + email + ".jpg" + "?alt=media&token=" + token;
    }).catch((err: any) => {
        return err;
    });
   

}