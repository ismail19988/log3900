package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.VectorObjectJSON

data class JoinDrawingResponse(
    val title: String,
    val message: String,
    val objects: MutableList<VectorObjectJSON>?,
    val version: Int?,
    val versions: Int?
)
