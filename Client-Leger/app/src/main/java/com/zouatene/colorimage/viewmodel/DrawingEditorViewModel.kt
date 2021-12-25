package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.model.request.DrawingRequest
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.service.DrawingService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DrawingEditorViewModel : ViewModel() {
    private val _strokeWidthChanged = MutableLiveData<Boolean>()
    val strokeWidthChanged: LiveData<Boolean> = _strokeWidthChanged

    private val _drawingLeft = MutableLiveData<Boolean>()
    val drawingLeft: LiveData<Boolean> = _drawingLeft

    var isChangingAttribute: Boolean = false

    fun changeStrokeWidth(strokeWidth: Float) {
        DrawingService.strokeWidth = strokeWidth
        _strokeWidthChanged.value = true
    }

    fun leaveDrawing(username: String, drawingName: String, preview: ByteArray) {
        val drawingRequest = DrawingRequest(username, drawingName, preview)
        RequestService.retrofitService.leaveDrawing(drawingRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() != 200)  {
                        println("Could not leave drawing")
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                        println(response.code())
                    } else {
                        _drawingLeft.value = true
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to leave drawing")
                    println(t.message)
                }
            })
    }
}