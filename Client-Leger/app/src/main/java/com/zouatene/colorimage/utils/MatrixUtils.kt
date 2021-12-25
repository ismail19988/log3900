package com.zouatene.colorimage.utils

import android.graphics.Matrix
import com.zouatene.colorimage.model.drawelement.IMatrix

object MatrixUtils {

    fun convertToMatrix(mat: IMatrix?): Matrix {
        var floatArray = floatArrayOf()
        if(mat != null) {
            floatArray = floatArrayOf(mat.a , mat.c, mat.e, mat.b, mat.d, mat.f, 0f, 0f, 1f)
        } else {
            floatArray = floatArrayOf(1f,0f, 0f, 0f, 1f, 0f, 0f, 0f, 1f)
        }
        val localMatrix = Matrix()
        localMatrix.setValues(floatArray)
        return localMatrix
    }

    fun convertToSVGMatrix(mat: Matrix): IMatrix {
        val values = floatArrayOf(0f,0f,0f,0f,0f,0f,0f,0f,0f )
        mat.getValues(values)
        return IMatrix(values[0], values[3], values[1], values[4], values[2], values[5])
    }
}