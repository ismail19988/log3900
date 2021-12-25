package com.zouatene.colorimage.model.team

data class Team(
    val name: String,
    val owner: String,
    val users: List<TeamUser>,
    val bio: String,
    val maxUsers: Int,
)
