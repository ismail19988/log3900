package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Shape

data class EditShapeRequestSocket(
    val user: String,
    val name: String,
    val id: String,
    val shape: Shape,
)
