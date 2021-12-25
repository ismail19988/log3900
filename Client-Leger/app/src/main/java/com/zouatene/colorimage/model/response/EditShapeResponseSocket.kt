package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Shape

data class EditShapeResponseSocket(
    val user: String,
    val name: String,
    val id: String,
    val shape: Shape,
    val fromUndoRedo: Boolean?
)
