package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Line

data class CreateLineResponseSocket(
    var user: String,
    var line: Line
)
