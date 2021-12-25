package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Point

data class DrawShapeResponseSocket(
    var name: String,
    var user: String,
    var id: String,
    var point: Point
)
