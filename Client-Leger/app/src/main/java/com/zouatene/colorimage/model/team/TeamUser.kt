package com.zouatene.colorimage.model.team

data class TeamUser(
    val user: String,
    // "connected" "disconnected" "busy"
    val status: String?
)
