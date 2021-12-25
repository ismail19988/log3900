package com.zouatene.colorimage.drawingelement

import android.graphics.*
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import com.zouatene.colorimage.model.drawelement.IMatrix
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.model.drawelement.VectorObject
import com.zouatene.colorimage.utils.MatrixUtils

abstract class ShapeElement : DrawingElement {
    abstract var color: String
    abstract var textColor : String
    abstract var text : String
    abstract var initialPoint: Point
    abstract var finalPoint: Point
    abstract var normalBoundingBox: RectF
    abstract var myStaticLayout: StaticLayout
    abstract var textPaint: TextPaint
    abstract var fillPaint: Paint
    abstract var textMat: Matrix

    constructor(shape: Shape) {
        color = if(shape.color != null) shape.color!! else "#FF000000"
        strokeColor = if(shape.strokeColor != null) shape.strokeColor!! else "#FF000000"
        strokeWidth = shape.strokeWidth
        id = shape.id
        z = shape.z
        initialPoint = shape.initialPoint
        finalPoint = shape.finalPoint
        isSelected = shape.isSelected
        textColor = if(shape.textColor != null) shape.textColor.toString() else "#FF000000"
        text = if(shape.text != null) shape.text.toString() else ""
        //#todo transform matrix conversion
        transformedBoundingBox = RectF()

        paint = Paint()
        paint.isAntiAlias = true
        paint.strokeWidth = shape.strokeWidth
        paint.style = Paint.Style.STROKE
        paint.color = Color.parseColor(strokeColor)

        fillPaint = Paint()
        fillPaint.isAntiAlias = true
        fillPaint.strokeWidth = shape.strokeWidth
        fillPaint.style = Paint.Style.FILL
        fillPaint.color = Color.parseColor(color)
    }

     override fun updateTransformedPath(){
         transformedPath = Path(path)
         transformedPath.transform(matrix)
         transformedPath.computeBounds(transformedBoundingBox, true)

         path.computeBounds(normalBoundingBox, true)
         createTextLayout(normalBoundingBox.width().toInt())
         
         textMat = Matrix(matrix)
         textMat.preTranslate(normalBoundingBox.left, normalBoundingBox.top)

     }

    protected fun createTextLayout(width:Int){
        textPaint = TextPaint()
        textPaint.color = Color.parseColor(textColor)
        textPaint.textSize = 15.8f
        textPaint.isAntiAlias = true

        val builder = StaticLayout.Builder.obtain(text, 0, text.length, textPaint , width )
            .setAlignment(Layout.Alignment.ALIGN_CENTER)
            .setLineSpacing(1f, 1f)
            .setIncludePad(false)
        myStaticLayout = builder.build()
    }



    fun modifyShape(shape: Shape) {
        color = if(shape.color != null) shape.color!! else "#FF000000"
        matrix = MatrixUtils.convertToMatrix(shape.matrix)
        strokeColor = if(shape.strokeColor != null) shape.strokeColor!! else "#FF000000"
        strokeWidth = shape.strokeWidth
        z = shape.z
        text = if(shape.text != null) shape.text!! else ""
        textColor = if(shape.textColor != null) shape.textColor!! else "#FF000000"
        updatePaintColors()
        updateTransformedPath()
    }

    private fun updatePaintColors() {
        paint.color = Color.parseColor(strokeColor)
        fillPaint.color = Color.parseColor(color)
        paint.strokeWidth = strokeWidth
    }

    override fun parseToInterface(transformMatrix: IMatrix): VectorObject {
        return Shape(
            id = this.id,
            z = this.z,
            matrix  = transformMatrix,
            strokeWidth = this.strokeWidth,
            color = color,
            isSelected = false,
            initialPoint = this.initialPoint,
            finalPoint = this.finalPoint,
            strokeColor = strokeColor,
            textColor = textColor,
            text = text,

        )
    }

    protected fun createRect(point1: Point, point2: Point): RectF {
        val top = minOf(point1.y, point2.y)
        val bottom = maxOf(point1.y, point2.y)
        val right = maxOf(point1.x, point2.x)
        val left = minOf(point1.x, point2.x)
        return RectF(left, top, right, bottom)
    }
}