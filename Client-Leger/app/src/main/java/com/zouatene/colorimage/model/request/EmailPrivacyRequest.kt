package com.zouatene.colorimage.model.request

data class EmailPrivacyRequest(
    val user: String,
    val isEmailPublic: Boolean
)
