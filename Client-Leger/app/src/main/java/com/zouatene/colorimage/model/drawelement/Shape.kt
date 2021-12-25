package com.zouatene.colorimage.model.drawelement

data class Shape(
    override var id: String,
    override var z: Int,
    override var matrix: IMatrix?,
    override var isSelected: Boolean,
    var initialPoint: Point,
    var color: String?,
    var finalPoint: Point,
    var strokeColor: String?,
    override var strokeWidth: Float,
    var text: String?,
    var textColor: String?
): VectorObject()

