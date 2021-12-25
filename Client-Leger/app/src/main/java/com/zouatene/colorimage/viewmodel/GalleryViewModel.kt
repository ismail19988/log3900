package com.zouatene.colorimage.viewmodel

import android.content.Context
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.model.request.DrawingRequest
import com.zouatene.colorimage.model.response.DrawingListResponse
import com.zouatene.colorimage.model.response.JoinDrawingResponse
import com.zouatene.colorimage.model.result.JoinRoomResult
import com.zouatene.colorimage.network.RequestService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class GalleryViewModel(private val context: Context) : ViewModel() {
    private val _drawingList = MutableLiveData<ArrayList<IDrawing>?>()
    val drawingList: LiveData<ArrayList<IDrawing>?> = _drawingList

    private val _joinDrawingResult = MutableLiveData<JoinRoomResult>()
    val joinDrawingResult: LiveData<JoinRoomResult> = _joinDrawingResult

    fun getAllDrawings() {
        RequestService.retrofitService.getAllDrawings()
            .enqueue(object : Callback<DrawingListResponse> {
                override fun onResponse(
                    call: Call<DrawingListResponse>,
                    response: Response<DrawingListResponse>
                ) {
                    if (response.code() == 200) {
                        val drawings = ArrayList(response.body()!!.drawings)

                        _drawingList.value = drawings
                    } else {
                        // TODO("Not yet implemented")
                        println("Couldn't get drawing list")
                        _drawingList.value = null
                    }
                }

                override fun onFailure(call: Call<DrawingListResponse>, t: Throwable) {
//                    TODO("Not yet implemented")
                    println("Failed to get drawing list")
                    println(t.message)
                    _drawingList.value = null
                }
            })
    }

    fun joinDrawing(username: String, drawingName: String) {
        val joinDrawingRequest = DrawingRequest(username, drawingName)

        RequestService.retrofitService.joinDrawing(joinDrawingRequest)
            .enqueue(object : Callback<JoinDrawingResponse> {
                override fun onResponse(
                    call: Call<JoinDrawingResponse>,
                    response: Response<JoinDrawingResponse>
                ) {
                    if (response.code() == 200) {
                        _joinDrawingResult.value = JoinRoomResult(true, drawingName, response.body()?.objects, response.body()?.version)
                    } else {
                        println("Could not join drawing")
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                        println(response.code())
                        Toast.makeText(context, bodyError.message, Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<JoinDrawingResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to join drawing")
                    println(t.message)
                }
            })
    }
}