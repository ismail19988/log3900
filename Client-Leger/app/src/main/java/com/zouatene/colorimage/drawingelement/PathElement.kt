package com.zouatene.colorimage.drawingelement

import android.graphics.*
import com.zouatene.colorimage.model.drawelement.Line
import com.zouatene.colorimage.model.drawelement.IMatrix
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.VectorObject
import com.zouatene.colorimage.utils.MatrixUtils

class PathElement : DrawingElement {
    override lateinit var id: String
    override var z: Int = 0
    override var path: Path
    override lateinit var transformedPath: Path
    override var strokeWidth: Float = 3.0f
    override var strokeColor: String = "#FF000000"
    override var matrix: Matrix

    override var isSelected: Boolean = false

    override lateinit var transformedBoundingBox: RectF

    override var paint: Paint = Paint()

    constructor(line: Line) : super() {
        strokeColor = if(line.color != null) line.color!! else "#FF000000"
        strokeWidth = line.strokeWidth
        id = line.id
        z = line.z
        paint.color = Color.parseColor(strokeColor)
        paint.strokeWidth = line.strokeWidth

        matrix = MatrixUtils.convertToMatrix(line.matrix)
        transformedBoundingBox = RectF()
        paint.color = Color.parseColor(strokeColor)
        paint.isAntiAlias = true
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = line.strokeWidth
        paint.strokeJoin = Paint.Join.ROUND
        paint.strokeCap = Paint.Cap.ROUND

        path = Path()
        if (!line.points.isNullOrEmpty()) {
            path.moveTo(line.points[0].x, line.points[0].y)
            for (i in 1..line.points.size) {
                path.lineTo(line.points[i - 1].x, line.points[i - 1].y)
            }
        }
        
        updateTransformedPath()
    }

    fun modifyLine(line: Line) {
        strokeColor = if(line.color != null) line.color!! else "#FF000000"
        strokeWidth = line.strokeWidth
        matrix = MatrixUtils.convertToMatrix(line.matrix)
        id = line.id
        z = line.z
        paint.color = Color.parseColor(strokeColor)
        paint.strokeWidth = line.strokeWidth
        updateTransformedPath()
    }




    override fun parseToInterface(transformMatrix: IMatrix): VectorObject {
        return Line(
            id = this.id,
            z = this.z,
            matrix  = transformMatrix,
            strokeWidth = this.strokeWidth,
            color = strokeColor,
            points = mutableListOf(),
            isSelected = false
        )
    }


    override fun draw(canvas: Canvas) {
        canvas.drawPath(transformedPath, paint)
    }

    override fun addPoint(point: Point) {
        path.lineTo(point.x, point.y)
        updateTransformedPath()
    }
}