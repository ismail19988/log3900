package com.zouatene.colorimage.tools

import android.view.MotionEvent
import android.view.View
import com.zouatene.colorimage.utils.ToolType
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.request.CreateLineRequestSocket
import com.zouatene.colorimage.model.request.DrawLineRequestSocket
import com.zouatene.colorimage.model.drawelement.ElementInfoSocket
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService

class PencilTool(type: ToolType, icon: Int) : Tool(type, icon) {

    override fun getOnTouchListener(username: String): View.OnTouchListener {
        return View.OnTouchListener { v, motionEvent ->
            when (motionEvent?.action) {
                MotionEvent.ACTION_DOWN -> {
                    if (!DrawingService.isDrawing) {
                        val requestSocket = CreateLineRequestSocket(
                            user = username,
                            color = DrawingService.primaryColor,
                            strokeWidth = DrawingService.strokeWidth,
                            startingPoint = Point(motionEvent.x, motionEvent.y),
                            name = DrawingService.drawingName
                        )
                        SocketHandler.mSocket.emit(
                            "create_line",
                            RequestService.convertToJson(requestSocket)
                        )
                        DrawingService.isDrawing = true
                        DrawingService.currentId = null
                    }

                }
                MotionEvent.ACTION_MOVE -> {
                    if (DrawingService.isDrawing && !DrawingService.currentId.isNullOrBlank()) {
                        val requestSocket = DrawLineRequestSocket(
                            user = username,
                            point = Point(motionEvent.x, motionEvent.y),
                            name = DrawingService.drawingName,
                            id = DrawingService.currentId!!
                        )
                        SocketHandler.mSocket.emit(
                            "draw_line",
                            RequestService.convertToJson(requestSocket)
                        )
                    }
                }

                MotionEvent.ACTION_UP -> {
                    //for accessibility only
                    v.performClick()
                    val drawingId = DrawingService.currentId
                    if (DrawingService.isDrawing && drawingId != null) {
                        val requestSocket =
                            ElementInfoSocket(user = username, id = drawingId, name = DrawingService.drawingName)
                        SocketHandler.mSocket.emit(
                            "end_drawing",
                            RequestService.convertToJson(requestSocket)
                        )
                    }
                    DrawingService.isDrawing = false
                    DrawingService.currentId = null

                }
            }
            true
        }
    }
}