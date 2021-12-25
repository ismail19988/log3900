package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Point

data class CreateShapeRequestSocket(
    var name: String,
    var color: String,
    var strokeWidth: Float,
    var strokeColor: String,
    var initialPoint: Point,
    var user: String
)
