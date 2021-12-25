package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.ViewModel

class AvatarCollectionsDialogViewModel : ViewModel() {
    val avatarUrlMap = HashMap<Int, String>()

    fun mapAvatars() {
        avatarUrlMap[0] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FPepega.png?alt=media&token=41746437-ac6c-4527-9428-0bb895e66ccc"
        avatarUrlMap[1] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FPOGGERS.png?alt=media&token=7113b777-a34e-43b1-9b25-d3d926aeab51"
        avatarUrlMap[2] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FPepoThink.png?alt=media&token=e0a6482a-0f94-4231-a6d4-fe248c608e23"
        avatarUrlMap[3] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FBedge.png?alt=media&token=7ca911a5-10e9-4993-a71a-4cc42be158aa"
        avatarUrlMap[4] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FFeelsOkayMan.png?alt=media&token=52209eff-0eda-463b-bc36-6234ab5c3565"
        avatarUrlMap[5] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FpeepoHappy.png?alt=media&token=08020e51-8448-4edb-bce4-d92efd061b04"
        avatarUrlMap[6] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FmonkaHmm.png?alt=media&token=c843fa8a-37a7-4157-a24a-1d010e07137e"
        avatarUrlMap[7] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FpeepoWTF.png?alt=media&token=80a8acb1-ef33-4663-9602-0ca5f6892efc"
        avatarUrlMap[8] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2FSusge.png?alt=media&token=e320dc08-007c-4328-8e6d-c5385f5c04c7"
        avatarUrlMap[9] =
            "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2Fpeepolove.png?alt=media&token=e2f5c89a-5479-43ae-bf3e-7db3ab7de856"
    }
}