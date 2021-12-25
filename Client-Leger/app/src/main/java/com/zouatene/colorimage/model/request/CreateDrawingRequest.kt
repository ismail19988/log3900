package com.zouatene.colorimage.model.request

data class CreateDrawingRequest(
    val drawing: String,
    val owner: String,
    val privacy: Int,
    val password: String? = null,
    val team: String? = null
)
