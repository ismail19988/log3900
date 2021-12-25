package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Point

data class CreateLineRequestSocket(
    var name: String,
    var user: String,
    var strokeWidth: Float,
    var color: String,
    var startingPoint: Point,

    )
