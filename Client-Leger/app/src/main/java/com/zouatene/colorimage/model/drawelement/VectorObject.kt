package com.zouatene.colorimage.model.drawelement

abstract class VectorObject {
    abstract var id: String
    abstract var z: Int
    abstract var matrix: IMatrix?
    abstract var strokeWidth: Float
    abstract var isSelected: Boolean
}
