package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Point

data class DrawLineResponseSocket(
    var point: Point,
    var id: String
)
