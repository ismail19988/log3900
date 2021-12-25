package com.zouatene.colorimage.model.drawelement

data class Line(
    override var id:String,
    override var z: Int,
    override var matrix: IMatrix?,
    override var strokeWidth: Float,
    override var isSelected: Boolean,
    var color: String?,
    val points: MutableList<Point>?,
     ) : VectorObject()
