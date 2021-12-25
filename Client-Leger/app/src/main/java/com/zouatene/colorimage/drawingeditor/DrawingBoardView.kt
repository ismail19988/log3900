package com.zouatene.colorimage.drawingeditor

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.zouatene.colorimage.drawingelement.*
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService
import com.zouatene.colorimage.utils.Constants
import kotlin.reflect.KClass
import kotlin.reflect.cast
import android.graphics.Bitmap
import com.zouatene.colorimage.utils.HandleLocation
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.model.drawelement.*
import com.zouatene.colorimage.model.request.UndoRedoRequestSocket
import com.zouatene.colorimage.utils.SelectionHandleElement
import java.io.ByteArrayOutputStream


class DrawingBoardView : View {

    var elementsMap: MutableMap<String, DrawingElement> = mutableMapOf()
    var elementsOrder: MutableList<String> = mutableListOf()
    private var selectionPaintUser: Paint = Paint()
    private var selectionPaint: Paint = Paint()
    private var _selectedElement = MutableLiveData<DrawingElement?>()
    val selectedElement: LiveData<DrawingElement?> = _selectedElement
    private var resizeHandles: MutableList<SelectionHandleElement> = mutableListOf()

    constructor(context: Context) : super(context) {
        selectionPaintUser = initSelectionPaint(Color.BLUE)
        selectionPaint = initSelectionPaint(Color.RED)
    }

    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
        selectionPaintUser = initSelectionPaint(Color.BLUE)
        selectionPaint = initSelectionPaint(Color.RED)
    }

    fun reset() {
        _selectedElement.value = null
    }

    private fun initSelectionPaint(color: Int): Paint {
        val paint = Paint()
        paint.color = color
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = Constants.STROKE_WIDTH_SELECTION
        paint.pathEffect = DashPathEffect(floatArrayOf(10f, 10f), 0f)
        return paint
    }

    override fun onDraw(canvas: Canvas) {
        for (value in elementsOrder) {
            val element = elementsMap[value]
            element?.draw(canvas)

            if(DrawingService.currentId != null && element?.id != null && element.id == DrawingService.currentId) {
                continue
            }

            if (element?.isSelected == true &&  !(_selectedElement.value?.id != null && element.id == _selectedElement.value!!.id)) {
                val isSelectedByUser = false
                element.drawSelectionBox(canvas, isSelectedByUser, selectionPaint)
            }
        }
        val element = _selectedElement.value
        element?.drawSelectionBox(canvas, true, selectionPaintUser)
    }

    fun setListDrawingElements(listElement: MutableList<VectorObjectJSON>?) {
        elementsMap = mutableMapOf()
        elementsOrder = mutableListOf()
        if(listElement.isNullOrEmpty())
            return
        for(element in listElement){
            val drawingElement = RequestService.convertToDrawingElement(element)
            if(drawingElement != null) {
                addNewElement(drawingElement)
            }
        }
        invalidate()

    }

    fun changePathTo(id: String, point: Point, type: KClass<out DrawingElement>) {
        if(elementsMap[id] != null ) {
            (type.cast(elementsMap[id])).addPoint(point)
        }
        invalidate()
    }

    fun addNewElement(drawingElement: DrawingElement) {
        elementsMap[drawingElement.id] = drawingElement
        elementsOrder.add(drawingElement.id)
        invalidate()
    }

    fun selectElement(currentUser: String, id: String, responseUser: String) {
        if (currentUser == responseUser) {
            val currentSelectedElement = selectedElement.value
            if (currentSelectedElement != null) {
                val requestSocket = ElementInfoSocket(
                    user = responseUser,
                    id = currentSelectedElement.id,
                    name = DrawingService.drawingName
                )
                SocketHandler.mSocket.emit(
                    "unselect",
                    RequestService.convertToJson(requestSocket)
                )
            }
            selectUserElement(elementsMap[id])
            // NEED TO CHANGE TOOL
            //changeTool(0 /*ENUM*/)
        }
        elementsMap[id]?.isSelected = true
        invalidate()
    }

    private fun selectUserElement(element: DrawingElement?) {
        if (_selectedElement.value != null) {
            selectedElement.value?.isSelected = false
            _selectedElement.value = null
        }
        _selectedElement.value = element
        selectedElement.value?.isSelected = true
        updateSelectionHandle()
    }

    fun unselectElement(currentUser: String, id: String, responseUser: String) {
        val localSelectedElement = selectedElement.value
        if (localSelectedElement != null && id == localSelectedElement.id && currentUser == responseUser) {
            _selectedElement.value = null
        }
        elementsMap[id]?.isSelected = false
        invalidate()
    }

    private fun updateSelectionHandle() {
        val box = _selectedElement.value?.getSelectionBoundingBox() ?: return
        resizeHandles = mutableListOf()
        resizeHandles.add(SelectionHandleElement(box.left, box.centerY(), HandleLocation.LEFT))
        resizeHandles.add(SelectionHandleElement(box.centerX(), box.top, HandleLocation.TOP))
        resizeHandles.add(SelectionHandleElement(box.right, box.centerY(), HandleLocation.RIGHT))
        resizeHandles.add(SelectionHandleElement(box.centerX(), box.bottom, HandleLocation.BOTTOM))
    }

    fun getSelectedHandle(x: Float, y: Float): SelectionHandleElement? {
        for (handle in resizeHandles) {
            if(handle.pointOnHandle(x, y))
               return handle
        }
        return null
    }

    fun getHandlePosition(location: HandleLocation): Point {
        for (handle in resizeHandles) {
            if(handle.location == location)
                return Point(handle.centerX, handle.centerY)
        }
        return Point(0f,0f)
    }

    fun getOppositesHandle(location: HandleLocation): Point {
        return when(location) {
            HandleLocation.LEFT -> {
                getHandlePosition(HandleLocation.RIGHT)
            }
            HandleLocation.TOP -> {
                getHandlePosition(HandleLocation.BOTTOM)
            }
            HandleLocation.RIGHT -> {
                getHandlePosition(HandleLocation.LEFT)
            }
            HandleLocation.BOTTOM -> {
                getHandlePosition(HandleLocation.TOP)
            }
        }
    }

    fun getFirstElementOnPoint(x: Float, y: Float): DrawingElement? {
        for (elementIndex in elementsOrder.reversed()) {
            val isPointOnElement = elementsMap[elementIndex]?.pointOnElement(x, y)
            if (isPointOnElement == true) {
                return elementsMap[elementIndex]
            }
        }
        return null
    }

    fun deleteElement(id: String) {
        if (elementsMap[id] == null)
            return

        if (selectedElement.value?.id == id){
            _selectedElement.value = null
        }

        elementsOrder.remove(id)
        elementsMap.remove(id)

        invalidate()
    }

    fun emitUnselectEvent() {
        val loggedUser = LoggedUserManager(context)
        val user = loggedUser.getLoggedInUser()


        if (_selectedElement.value != null) {
            val requestSocket = ElementInfoSocket(
                user = user.username,
                id = selectedElement.value!!.id,
                name = DrawingService.drawingName
            )
            SocketHandler.mSocket.emit(
                "unselect",
                RequestService.convertToJson(requestSocket)
            )
        }
    }

    fun emitDeleteEvent(id: String) {
        val loggedUser = LoggedUserManager(context)
        val user = loggedUser.getLoggedInUser()
        val requestSocket = ElementInfoSocket(
            user = user.username,
            id = id,
            name = DrawingService.drawingName
        )
        SocketHandler.mSocket.emit(
            "delete",
            RequestService.convertToJson(requestSocket)
        )
    }

    fun emitUndoEvent(user: String) {
        val requestSocket = UndoRedoRequestSocket(
            user = user
        )

        SocketHandler.mSocket.emit(
            "undo",
            RequestService.convertToJson(requestSocket)
        )
    }

    fun emitRedoEvent(user: String) {
        val requestSocket = UndoRedoRequestSocket(
            user = user
        )

        SocketHandler.mSocket.emit(
            "redo",
            RequestService.convertToJson(requestSocket)
        )
    }

    fun editElement(vectorObject: VectorObject) {
        val element = elementsMap[vectorObject.id]
        if (element is PathElement && vectorObject is Line) {
            element.modifyLine(vectorObject )
        } else if ( element is ShapeElement && vectorObject is Shape) {
            element.modifyShape(vectorObject)
        }
        if(selectedElement.value != null && element?.id == selectedElement.value?.id)
            updateSelectionHandle()
        invalidate()
    }

    fun forceRefreshSelectedElement() {
        _selectedElement.value = _selectedElement.value
    }

    fun editZ(response: List<LayerObject>) {

        for(obj in response) {
            if(elementsMap[obj.id] != null && obj.z != null){
                elementsMap[obj.id]?.z = obj.z
            }
        }
        //GIGA BRAIN?
        elementsOrder = elementsMap.entries.sortedBy { it.value.z }.map{ it.value.id} as MutableList<String>
        invalidate()
    }

    fun getViewByteArray(): ByteArray {
        val bitmap =
            Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(Color.WHITE)
        val canvas = Canvas(bitmap)
        draw(canvas)

        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 10, outputStream)
        return outputStream.toByteArray()
    }
}