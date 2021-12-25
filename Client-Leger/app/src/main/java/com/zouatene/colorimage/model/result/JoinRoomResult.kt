package com.zouatene.colorimage.model.result

import com.zouatene.colorimage.model.drawelement.VectorObjectJSON

data class JoinRoomResult(
    val success: Boolean,
    val drawingName: String,
    val listElement: MutableList<VectorObjectJSON>?,
    val version: Int? 
)
