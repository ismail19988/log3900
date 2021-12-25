package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.utils.MessageOwner
import com.zouatene.colorimage.model.chat.ChatMessage
import com.zouatene.colorimage.model.chat.Message
import com.zouatene.colorimage.model.request.MessageSocketRequest
import com.zouatene.colorimage.model.request.RoomRequest
import com.zouatene.colorimage.model.response.ChatRoomResponse
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChatViewModel : ViewModel() {

    private val _sendMessageSuccess = MutableLiveData<Boolean>()
    val sendMessageSuccess: LiveData<Boolean> = _sendMessageSuccess

    private val _joinRoomSuccess = MutableLiveData<Boolean>()
    val joinRoomSuccess: LiveData<Boolean> = _joinRoomSuccess

    private val _messageHistory = MutableLiveData<ArrayList<ChatMessage>>()
    val messageHistory: LiveData<ArrayList<ChatMessage>> = _messageHistory

    fun sendMessage(roomName: String, message: String, username: String) {
        if (message.isNotBlank()) {
            SocketHandler.mSocket.on("chat_error") {
//                _sendMessageSuccess.value = false
                println(it[0].toString())
            }
            SocketHandler.mSocket.emit(
                "send_message",
                RequestService.convertToJson(
                    MessageSocketRequest(
                        roomName,
                        Message(
                            message.trim(),
                            username,
                            .0
                        )
                    )
                )
            )
            _sendMessageSuccess.value = true
        }
    }

    fun receiveMessage(messageJson: String, username: String): Pair<ChatMessage, String> {
        val messageReceived: MessageSocketRequest =
            RequestService.convertJson(
                messageJson,
                MessageSocketRequest::class.java
            ) as MessageSocketRequest

        val messageOwner =
            if (messageReceived.message.sender == username) MessageOwner.SENDER else MessageOwner.RECEIVER

        return Pair(
            ChatMessage(
                messageReceived.message,
                messageOwner
            ), messageReceived.room
        )
    }

    fun getRoomData(roomName: String, username: String) {
        val roomRequest = RoomRequest(username, roomName)
        RequestService.retrofitService.postRoomData(roomRequest)
            .enqueue(object : Callback<ChatRoomResponse> {
                override fun onResponse(
                    call: Call<ChatRoomResponse>,
                    response: Response<ChatRoomResponse>
                ) {
                    if (response.code() == 200) {
                        _joinRoomSuccess.value = true

                        val history = ArrayList(response.body()!!.room.history)
                        _messageHistory.value = ArrayList(history.map {
                            ChatMessage(
                                it,
                                if (it.sender == username) MessageOwner.SENDER else MessageOwner.RECEIVER
                            )
                        }.reversed())
                        println("users: ${response.body()!!.room.users}")
                    } else {
                        _joinRoomSuccess.value = false

                        // TODO("Not yet implemented")
//                        val bodyError =
//                            RequestService.convertJson(
//                                response.errorBody()?.source(),
//                                ChatRoomResponse::class.java
//                            ) as ChatRoomResponse
                    }
                }

                override fun onFailure(call: Call<ChatRoomResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    _joinRoomSuccess.value = false
                }
            })
    }


}