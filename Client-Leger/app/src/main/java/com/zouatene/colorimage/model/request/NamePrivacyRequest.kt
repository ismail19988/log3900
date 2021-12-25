package com.zouatene.colorimage.model.request

data class NamePrivacyRequest(
    val user: String,
    val isNamePublic: Boolean
)
