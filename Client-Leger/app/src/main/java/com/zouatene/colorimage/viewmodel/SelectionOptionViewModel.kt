package com.zouatene.colorimage.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.drawelement.Line
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.model.drawelement.VectorObject
import com.zouatene.colorimage.model.request.EditLineRequestSocket
import com.zouatene.colorimage.model.request.EditShapeRequestSocket
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService

class SelectionOptionViewModel(private val context: Context): ViewModel() {
    fun emitEditEvent(vectorObject: VectorObject, username: String, event: String) {
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