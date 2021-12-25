package com.zouatene.colorimage.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import java.io.ByteArrayOutputStream

class AvatarViewModel : ViewModel() {

    lateinit var avatarByteArray: ByteArray

    fun changeAvatarImage(imageBitmap: Bitmap) {
        val outputStream = ByteArrayOutputStream()
        imageBitmap.compress(Bitmap.CompressFormat.JPEG, 10, outputStream)
        avatarByteArray = outputStream.toByteArray()
    }
}