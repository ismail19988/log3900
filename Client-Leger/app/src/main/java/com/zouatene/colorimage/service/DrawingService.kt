package com.zouatene.colorimage.service

import com.zouatene.colorimage.drawingeditor.DrawingBoardView

object DrawingService {
    var isDrawing: Boolean = false
    var currentId: String? = null
    var primaryColor: String = "#FF000000"
    var secondaryColor: String = "#FF00FF00"

    var strokeWidth: Float = 3f

    lateinit var drawingView: DrawingBoardView
    lateinit var drawingName: String

    fun reset() {
        isDrawing = false
        currentId = null

        primaryColor = "#FF000000"
        secondaryColor = "#FF00FF00"

        strokeWidth = 3f

        drawingName = ""
    }

    fun resetState() {
        isDrawing = false
        currentId = null
    }
}