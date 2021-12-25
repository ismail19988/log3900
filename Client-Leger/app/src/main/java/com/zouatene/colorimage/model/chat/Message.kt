package com.zouatene.colorimage.model.chat

data class Message(
    var content: String,
    var sender: String,
    var timestamp: Double,
    var avatar: String? = null
)
