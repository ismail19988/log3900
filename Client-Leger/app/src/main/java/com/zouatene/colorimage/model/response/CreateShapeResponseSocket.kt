package com.zouatene.colorimage.model.response

import com.zouatene.colorimage.model.drawelement.Shape


data class CreateShapeResponseSocket(
    var shape: Shape,
    var user: String
)
