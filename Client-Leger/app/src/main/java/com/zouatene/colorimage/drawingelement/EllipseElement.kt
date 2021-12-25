package com.zouatene.colorimage.drawingelement

import android.graphics.*
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.utils.MatrixUtils
import org.w3c.dom.Text

class EllipseElement : ShapeElement {
    override lateinit var id: String
    override var z: Int = 0
    override var path: Path
    override lateinit var transformedPath: Path
    override var strokeWidth: Float = 1f
    override lateinit var color: String
    override lateinit var textColor: String
    override lateinit var text: String

    override lateinit var strokeColor: String
    override var matrix: Matrix

    override var paint: Paint = Paint()

    override var isSelected: Boolean = false
    override lateinit var transformedBoundingBox: RectF
    override lateinit var initialPoint: Point
    override lateinit var finalPoint: Point
    override var normalBoundingBox: RectF = RectF()
    override lateinit var myStaticLayout: StaticLayout
    override lateinit var textPaint: TextPaint
    override lateinit var fillPaint: Paint
    override lateinit var textMat: Matrix


    constructor(ellipse: Shape) : super(ellipse) {
        strokeWidth = ellipse.strokeWidth
        path = Path()
        matrix = MatrixUtils.convertToMatrix(ellipse.matrix)
        path.addOval(createRect(ellipse.initialPoint, ellipse.finalPoint), Path.Direction.CCW)
        paint = Paint()
        paint.isAntiAlias = true
        paint.strokeWidth = ellipse.strokeWidth
        paint.style = Paint.Style.STROKE
        paint.color = Color.parseColor(strokeColor)

        fillPaint = Paint()
        fillPaint.isAntiAlias = true
        fillPaint.strokeWidth = ellipse.strokeWidth
        fillPaint.style = Paint.Style.FILL
        fillPaint.color = Color.parseColor(color)
        path.computeBounds(normalBoundingBox, true)
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

    override fun updateTransformedPath() {
        transformedPath = Path(path)
        transformedPath.transform(matrix)


        transformedPath.computeBounds(transformedBoundingBox, true)
        val regionPath = Region()
        regionPath.setPath(
            transformedPath, Region(
                transformedBoundingBox.left.toInt(),
                transformedBoundingBox.top.toInt(),
                transformedBoundingBox.right.toInt(),
                transformedBoundingBox.bottom.toInt()
            )
        )
        transformedBoundingBox = RectF(regionPath.bounds)

        path.computeBounds(normalBoundingBox, true)
        createTextLayout(normalBoundingBox.width().toInt())

        textMat = Matrix(matrix)
        textMat.preTranslate(normalBoundingBox.left, normalBoundingBox.top)
    }

    override fun addPoint(point: Point) {
        this.finalPoint = point
        path = Path()
        path.addOval(createRect(initialPoint, point), Path.Direction.CW)
        updateTransformedPath()
    }
}