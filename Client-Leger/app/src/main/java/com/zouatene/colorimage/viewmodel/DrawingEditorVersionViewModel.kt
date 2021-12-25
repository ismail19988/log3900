package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.DataDrawing
import com.zouatene.colorimage.model.request.GetDrawingDataRequest
import com.zouatene.colorimage.model.response.GetDrawingDataResponse
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.utils.HttpCode
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DrawingEditorVersionViewModel : ViewModel() {

    private val _drawingData = MutableLiveData<DataDrawing?>()
    val drawingData: LiveData<DataDrawing?> = _drawingData

    fun getDrawingData(drawingName: String) {
        val drawingRequest = GetDrawingDataRequest(drawingName)
        RequestService.retrofitService.getDrawingData(drawingRequest)
            .enqueue(object : Callback<GetDrawingDataResponse> {
                override fun onResponse(
                    call: Call<GetDrawingDataResponse>,
                    response: Response<GetDrawingDataResponse>
                ) {
                    if(response.code() == HttpCode.AUTHORIZED) {
                        _drawingData.value = response.body()?.drawing

                    } else {
                        println("Could not get drawing data")
                        println(response.code())
                        _drawingData.value = null
                    }
                }

                override fun onFailure(call: Call<GetDrawingDataResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to get drawing data")
                    println(t.message)
                    _drawingData.value = null
                }
            })
    }
}