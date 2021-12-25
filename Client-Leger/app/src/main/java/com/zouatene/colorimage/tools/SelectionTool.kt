package com.zouatene.colorimage.tools

import android.view.MotionEvent
import android.view.View
import com.zouatene.colorimage.utils.HandleLocation
import com.zouatene.colorimage.utils.SelectionHandleElement
import com.zouatene.colorimage.utils.ToolType
import com.zouatene.colorimage.model.drawelement.Line
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.model.drawelement.VectorObject
import com.zouatene.colorimage.model.request.EditLineRequestSocket
import com.zouatene.colorimage.model.request.EditShapeRequestSocket
import com.zouatene.colorimage.model.drawelement.ElementInfoSocket
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService
import com.zouatene.colorimage.utils.MatrixUtils

class SelectionTool(type: ToolType, icon: Int) : Tool(type, icon) {

    enum class SelectionState {
        NORMAL, TRANSLATION, SCALE
    }

    private var selectionState = SelectionState.NORMAL
    private var lastTranslationPoint = Point(0f,0f)
    private var initialScalePosition = Point(0f,0f)
    private var currentHandlePosition: HandleLocation? = null

    override fun getOnTouchListener(username: String): View.OnTouchListener {


        return View.OnTouchListener { v, motionEvent ->
            when (motionEvent?.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.performClick()
                    val drawingView = DrawingService.drawingView
                    if (!DrawingService.isDrawing) {
                        val element =
                            drawingView.getFirstElementOnPoint(motionEvent.x, motionEvent.y)
                        val handle = drawingView.getSelectedHandle(motionEvent.x, motionEvent.y)
                        val selectedElement = drawingView.selectedElement.value

                        if(handle != null) {
                            selectionState = SelectionState.SCALE
                            initialScalePosition = Point(motionEvent.x, motionEvent.y)
                            currentHandlePosition = handle.location
                        } else if(selectedElement != null && selectedElement.id == element?.id) {
                            selectionState = SelectionState.TRANSLATION
                            lastTranslationPoint = Point(motionEvent.x, motionEvent.y)
                            // To recheck : passe par reference or not ?
                            val vecObj = selectedElement.parseToInterface(MatrixUtils.convertToSVGMatrix(selectedElement.matrix))
                            emitEditEvent(vecObj, username, "start_edit")

                        } else {
                            if (element != null) {
                                emitSelectionEvent(username, element.id, "select" )
                            } else if (selectedElement != null) {
                                emitSelectionEvent(username, selectedElement.id, "unselect" )
                            }
                        }
                    }
                }

                MotionEvent.ACTION_MOVE -> {
                    val selectedElement = DrawingService.drawingView.selectedElement.value
                    val localHandleLocation = currentHandlePosition
                    if(selectedElement != null ) {

                        if(selectionState == SelectionState.TRANSLATION ) {

                            val vecObj = selectedElement.getTranslateMatrix((motionEvent.x - lastTranslationPoint.x) ,(motionEvent.y - lastTranslationPoint.y))
                            emitEditEvent(vecObj, username, "start_edit")
                            DrawingService.drawingView.editElement(vecObj)
                            lastTranslationPoint = Point(motionEvent.x, motionEvent.y)

                        } else if(selectionState == SelectionState.SCALE && localHandleLocation != null){
                            val localCurrentHandle = DrawingService.drawingView.getHandlePosition(localHandleLocation)
                            //insert code
                            val pairScale = getScaleFromPosition(SelectionHandleElement(localCurrentHandle.x, localCurrentHandle.y, localHandleLocation ),motionEvent.x - initialScalePosition.x ,motionEvent.y - initialScalePosition.y )
                            if(isOutsideScalingBound(localHandleLocation, Point(motionEvent.x, motionEvent.y), pairScale.second) ) {
                                val vecObj = selectedElement.getScaledVectorObject(pairScale.first, pairScale.second)
                                emitEditEvent(vecObj, username, "start_edit")
                                DrawingService.drawingView.editElement(vecObj)
                                initialScalePosition = Point(motionEvent.x, motionEvent.y)
                            }
                        }
                    }
                }

                MotionEvent.ACTION_UP -> {
                    val selectedElement = DrawingService.drawingView.selectedElement.value
                    if(selectedElement != null ) {
                        when(selectionState) {
                            SelectionState.TRANSLATION -> {
                                val vecObj = selectedElement.getTranslateMatrix((motionEvent.x - lastTranslationPoint.x) ,(motionEvent.y - lastTranslationPoint.y))
                                emitEditEvent(vecObj, username, "end_edit")
                            }
                            SelectionState.SCALE -> {
                                val localHandleLocation = currentHandlePosition

                                if(localHandleLocation != null) {
                                    val localCurrentHandle = DrawingService.drawingView.getHandlePosition(localHandleLocation)
                                    val pairScale = getScaleFromPosition(SelectionHandleElement(localCurrentHandle.x, localCurrentHandle.y, localHandleLocation ),motionEvent.x - initialScalePosition.x ,motionEvent.y - initialScalePosition.y )
                                    val vecObj = selectedElement.getScaledVectorObject(pairScale.first, pairScale.second)
                                    emitEditEvent(vecObj, username, "end_edit")
                                    DrawingService.drawingView.editElement(vecObj)
                                }
                            }
                        }
                        selectionState = SelectionState.NORMAL
                        currentHandlePosition = null
                    }

                }

            }
            true
        }
    }

    private fun getScaleFromPosition(handle: SelectionHandleElement, dx: Float, dy: Float): Pair<Point, Point> {
        val scaleFactor = Point(0f,0f)
        val oppositePoint =  DrawingService.drawingView.getOppositesHandle(handle.location)
        when(handle.location) {
            HandleLocation.LEFT -> {
                scaleFactor.y = 1f
                if(handle.centerX + dx  >= oppositePoint.x  ) {
                    scaleFactor.x = 1f
                } else {
                    scaleFactor.x = kotlin.math.abs(handle.centerX + dx - oppositePoint.x) / kotlin.math.abs(handle.centerX  - oppositePoint.x)
                }
                return Pair(scaleFactor, oppositePoint)
            }
            HandleLocation.TOP -> {
                scaleFactor.x = 1f
                if(handle.centerY + dy  >= oppositePoint.y  ) {
                    scaleFactor.y = 1f
                } else {
                    scaleFactor.y = kotlin.math.abs(handle.centerY + dy - oppositePoint.y) / kotlin.math.abs(handle.centerY  - oppositePoint.y)
                }
                return Pair(scaleFactor, oppositePoint)
            }
            HandleLocation.RIGHT -> {
                scaleFactor.y = 1f
                if(handle.centerX + dx  <= oppositePoint.x  ) {
                    scaleFactor.x = 1f
                } else {
                    scaleFactor.x = kotlin.math.abs(handle.centerX + dx - oppositePoint.x) / kotlin.math.abs(handle.centerX  - oppositePoint.x)
                }
                return Pair(scaleFactor, oppositePoint)
            }
            HandleLocation.BOTTOM -> {
                scaleFactor.x = 1f
                if(handle.centerY + dy  <= oppositePoint.y  ) {
                    scaleFactor.y = 1f
                } else {
                    scaleFactor.y = kotlin.math.abs(handle.centerY + dy - oppositePoint.y) / kotlin.math.abs(handle.centerY  - oppositePoint.y)
                }
                return Pair(scaleFactor, oppositePoint)
            }

        }
    }


    private fun isOutsideScalingBound(location: HandleLocation, position : Point, opposite: Point): Boolean {
        return when(location) {
            HandleLocation.LEFT -> {
                position.x < opposite.x
            }
            HandleLocation.TOP -> {
                position.y < opposite.y
            }
            HandleLocation.RIGHT -> {
                position.x > opposite.x
            }
            HandleLocation.BOTTOM -> {
                position.y > opposite.y
            }
        }
    }

    private fun emitSelectionEvent(username: String, id:String, selectionEvent: String) {
        val requestSocket = ElementInfoSocket(
            user = username,
            id = id,
            name = DrawingService.drawingName,
        )
        SocketHandler.mSocket.emit(
            selectionEvent,
            RequestService.convertToJson(requestSocket)
        )
    }


    //TO REFACTOR duplicate
    private fun emitEditEvent(vectorObject: VectorObject, username: String, event: String) {
        if(vectorObject is Line) {
            val requestSocket = EditLineRequestSocket(
                user = username,
                name = DrawingService.drawingName,
                id = vectorObject.id,
                line = vectorObject
            )
            SocketHandler.mSocket.emit(
                event,
                RequestService.convertToJson(requestSocket)
            )
        } else if(vectorObject is Shape){
            val requestSocket = EditShapeRequestSocket(
                user = username,
                name = DrawingService.drawingName,
                id = vectorObject.id,
                shape = vectorObject
            )
            SocketHandler.mSocket.emit(
                event,
                RequestService.convertToJson(requestSocket)
            )
        }
    }




}