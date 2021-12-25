package com.zouatene.colorimage.viewmodel

import android.content.Context
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.IResponse
import com.zouatene.colorimage.model.Privacy
import com.zouatene.colorimage.model.request.CreateDrawingRequest
import com.zouatene.colorimage.network.RequestService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CreateDrawingDialogViewModel(private val context: Context) : ViewModel() {
    private val _createDrawingResult = MutableLiveData<Boolean>()
    val createDrawingResult: LiveData<Boolean> = _createDrawingResult

    fun createDrawing(drawingName: String, owner: String, privacy: Privacy, password: String?, team: String?) {
        val createDrawingRequest = CreateDrawingRequest(drawingName, owner, privacy.value, password, team)

        RequestService.retrofitService.createDrawing(createDrawingRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        println("created drawing")
                        _createDrawingResult.value = true
                    } else {
                        println("Could not create drawing")
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

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to create drawing")
                    println(t.message)
                }
            })
    }
}