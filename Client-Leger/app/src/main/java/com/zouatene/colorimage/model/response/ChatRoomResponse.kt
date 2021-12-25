package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.chat.Room

data class ChatRoomResponse(
    val title: String,
    val message: String,
    val room: Room
)
