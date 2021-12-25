package com.zouatene.colorimage.model.drawelement

data class VectorObjectJSON(
    var id:String,
    var z: Int,
    var matrix: IMatrix?,
    var strokeWidth: Float,
    var isSelected: Boolean,
    // ILine Attributes
    var color: String?,
    var points: MutableList<Point>?,
    //IShape Attributes
    var initialPoint: Point?,
    var finalPoint: Point?,
    var strokeColor: String?,
    var text: String?,
    var textColor: String?,
    var type: String?
)
