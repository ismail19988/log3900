package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Line

data class EditLineResponseSocket(
    val name: String,
    val user: String,
    val id: String,
    val line: Line,
    val fromUndoRedo: Boolean?

)
