package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.chat.Message

data class MessageSocketRequest(
    val room: String,
    val message: Message
)
