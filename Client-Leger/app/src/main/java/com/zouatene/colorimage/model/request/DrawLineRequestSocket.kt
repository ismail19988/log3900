package com.zouatene.colorimage.model.request

import com.zouatene.colorimage.model.drawelement.Point

data class DrawLineRequestSocket(
    var name: String,
    var user: String,
    var point: Point,
    var id: String
    )
