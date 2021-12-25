package com.zouatene.colorimage.model.result

import com.zouatene.colorimage.model.access.UserData

data class UserDataResult(
    val success: Boolean,
    val userData: UserData
)
