package com.zouatene.colorimage.model.access

import com.zouatene.colorimage.model.drawelement.Action

data class UserData(

    val email: String?,
    val password: String?,
    val firstname: String?,
    val lastname: String?,
    val username: String?,
    val avatar: String?,
    val average_collab_time: Double?,
    val nb_collaborations: Int?,
    val nb_ownership: Int?,
    val nb_teams: Int?,
    val totalTimeCollab: Double?,
    val isNamePublic: Boolean?,
    val isEmailPublic: Boolean?,
    val lastAction: List<Action>
)
