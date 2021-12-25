package com.zouatene.colorimage.drawingelement

import android.graphics.*
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.Shape
import android.text.StaticLayout
import android.text.TextPaint
import com.zouatene.colorimage.utils.MatrixUtils


class RectangleElement : ShapeElement {
    override lateinit var id: String
    override var z: Int = 0
    override var path: Path
    override lateinit var transformedPath: Path
    override var strokeWidth: Float = 1f
    override lateinit var color: String
    override lateinit var strokeColor: String
    override var matrix: Matrix

    override var paint: Paint = Paint()
    override var isSelected: Boolean = false
    override lateinit var transformedBoundingBox: RectF

    override lateinit var initialPoint: Point
    override lateinit var finalPoint: Point
    override var normalBoundingBox: RectF = RectF()
    override lateinit var textColor: String
    override lateinit var text: String
    override lateinit var myStaticLayout: StaticLayout
    override lateinit var textPaint: TextPaint
    override lateinit var fillPaint: Paint
    override lateinit var textMat: Matrix



    constructor(rect: Shape) : super(rect) {
        strokeWidth = rect.strokeWidth
        matrix = MatrixUtils.convertToMatrix(rect.matrix)
        path = Path()
        path.addRect(createRect(rect.initialPoint, rect.finalPoint), Path.Direction.CW)
        paint = Paint()
        paint.isAntiAlias = true
        paint.strokeWidth = rect.strokeWidth
        paint.style = Paint.Style.STROKE
        paint.color = Color.parseColor(strokeColor)

        fillPaint = Paint()
        fillPaint.isAntiAlias = true
        fillPaint.strokeWidth = rect.strokeWidth
        fillPaint.style = Paint.Style.FILL
        fillPaint.color = Color.parseColor(color)
        updateTransformedPath()

    }


    override fun draw(canvas: Canvas) {
        canvas.drawPath(transformedPath, fillPaint)
        canvas.drawPath(transformedPath, paint)
        if(!text.isNullOrBlank()) {
            canvas.save()
            canvas.setMatrix(textMat)
            myStaticLayout.draw(canvas)
            canvas.restore()
        }

    }

    override fun addPoint(point: Point) {
        this.finalPoint = point
        path = Path()
        path.addRect(createRect(initialPoint, point), Path.Direction.CW)
        updateTransformedPath()
    }

}