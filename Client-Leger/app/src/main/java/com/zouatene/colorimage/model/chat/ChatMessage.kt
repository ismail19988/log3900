package com.zouatene.colorimage.model.chat

import com.zouatene.colorimage.utils.MessageOwner

data class ChatMessage(
    var message: Message,
    var messageOwner: MessageOwner,
)
