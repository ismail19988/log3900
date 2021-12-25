import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { uuidv4 } from "../utils/uuidV4";

var serviceAccount = require("./log3900-102-firebase-adminsdk-d2nov-febec60184.json");

const firebaseApp = initializeApp({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
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