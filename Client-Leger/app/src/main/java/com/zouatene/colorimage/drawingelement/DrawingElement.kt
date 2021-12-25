package com.zouatene.colorimage.drawingelement

import android.graphics.*
import com.zouatene.colorimage.model.drawelement.IMatrix
import com.zouatene.colorimage.utils.Constants.STROKE_WIDTH_SELECTION
import com.zouatene.colorimage.utils.Constants.TOUCH_RADIUS
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.VectorObject
import com.zouatene.colorimage.utils.Constants.BORDER_HALF_LENGTH_RECTANGLE
import com.zouatene.colorimage.utils.MatrixUtils
import kotlin.math.roundToInt

abstract class DrawingElement {

    abstract var id: String
    abstract var z: Int
    abstract var path: Path
    abstract var transformedPath: Path
    abstract var strokeWidth: Float
    abstract var strokeColor: String

    abstract var matrix: Matrix

    abstract var paint: Paint
    abstract var isSelected: Boolean
    abstract var transformedBoundingBox: RectF

    abstract fun draw(canvas: Canvas)
    abstract fun addPoint(point: Point)
    abstract fun parseToInterface(transformMatrix: IMatrix): VectorObject



    fun pointOnElement(x: Float, y: Float): Boolean {
        val rectBounds = RectF()
        transformedPath.computeBounds(rectBounds, true)
        //Create region from path
        val regionPath = Region()
        regionPath.setPath(
            transformedPath, Region(
                rectBounds.left.toInt(),
                rectBounds.top.toInt(), rectBounds.right.toInt(), rectBounds.bottom.toInt()
            )
        )
        // Create Rectangle from point
        val touchRect = Rect(
            x.roundToInt() - TOUCH_RADIUS,
            y.roundToInt() - TOUCH_RADIUS,
            x.roundToInt() + TOUCH_RADIUS,
            y.roundToInt() + TOUCH_RADIUS
        )
        if (regionPath.quickReject(touchRect)) {
            return false
        }
        return regionPath.op(Region(touchRect), Region.Op.INTERSECT)
    }

     open fun updateTransformedPath(){
         transformedPath = Path(path)
         transformedPath.transform(matrix)
         transformedPath.computeBounds(transformedBoundingBox, true)
    }

    fun getSelectionBoundingBox(): RectF {
        val selectionBoundingBox = RectF(transformedBoundingBox)
        selectionBoundingBox.top -= this.strokeWidth/2f + STROKE_WIDTH_SELECTION/2f
        selectionBoundingBox.bottom += this.strokeWidth/2f + STROKE_WIDTH_SELECTION/2f
        selectionBoundingBox.left -= this.strokeWidth/2f + STROKE_WIDTH_SELECTION/2f
        selectionBoundingBox.right += this.strokeWidth/2f + STROKE_WIDTH_SELECTION/2f
        return selectionBoundingBox

    }

    fun drawSelectionBox(canvas: Canvas, isSelectedByUser: Boolean, paint: Paint) {
        val boundBox = getSelectionBoundingBox()
        canvas.drawRect(boundBox, paint)

        if(isSelectedByUser) {
            paint.style = Paint.Style.FILL
            drawScaleRectangle(boundBox.centerX(), boundBox.top, canvas, paint)
            drawScaleRectangle(boundBox.centerX(), boundBox.bottom, canvas, paint)
            drawScaleRectangle(boundBox.left, boundBox.centerY(), canvas, paint)
            drawScaleRectangle(boundBox.right, boundBox.centerY(), canvas, paint)
            paint.style = Paint.Style.STROKE
        }

    }

    fun getRotateMatrix(degree: Float): VectorObject {
        val localMatrix = Matrix(matrix)
        localMatrix.postRotate(degree, transformedBoundingBox.centerX(), transformedBoundingBox.centerY())
        return this.parseToInterface(MatrixUtils.convertToSVGMatrix(localMatrix))
    }

    fun getTranslateMatrix(dx: Float, dy: Float): VectorObject {
        val localMatrix = Matrix(matrix)
        localMatrix.postTranslate(dx, dy)
        return this.parseToInterface(MatrixUtils.convertToSVGMatrix(localMatrix))
    }

    fun getScaledVectorObject(scale: Point, position: Point): VectorObject {
        val localMatrix = Matrix(matrix)
        localMatrix.postScale(scale.x, scale.y, position.x, position.y)
        return this.parseToInterface(MatrixUtils.convertToSVGMatrix(localMatrix))
    }

    private fun drawScaleRectangle(x: Float, y: Float, canvas :Canvas, scalePaint: Paint) {
        canvas.drawOval(x - BORDER_HALF_LENGTH_RECTANGLE,y - BORDER_HALF_LENGTH_RECTANGLE, x + BORDER_HALF_LENGTH_RECTANGLE,y + BORDER_HALF_LENGTH_RECTANGLE, scalePaint)
    }




}