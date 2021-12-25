package com.zouatene.colorimage.model.response

data class LoginResponse(
    var title: String,
    var token: String,
    var username: String,
    var avatar: String?
)
