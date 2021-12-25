package com.zouatene.colorimage.model.request

data class DrawingRequest(
    val user: String,
    val drawing: String,
    val preview: ByteArray? = null
)
