package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Line

data class EditLineRequestSocket(
    val user: String,
    val name: String,
    val id: String,
    val line: Line
)
