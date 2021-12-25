package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Point

data class DrawShapeRequestSocket(
    var user: String,
    var name: String,
    var finalPoint: Point,
    var id: String
    )
