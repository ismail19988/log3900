package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.model.IResponse
import com.zouatene.colorimage.model.chat.Room
import com.zouatene.colorimage.model.chat.RoomSection
import com.zouatene.colorimage.model.chat.SectionedRoomListItem
import com.zouatene.colorimage.model.request.MessageSocketRequest
import com.zouatene.colorimage.model.request.RoomRequest
import com.zouatene.colorimage.model.request.UserRequest
import com.zouatene.colorimage.model.response.RoomListResponse
import com.zouatene.colorimage.model.result.RoomResult
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.utils.Constants.ROOM_DRAWING_PREFIX
import com.zouatene.colorimage.utils.Constants.ROOM_TEAM_PREFIX
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RoomListViewModel : ViewModel() {
    private val _roomList = MutableLiveData<ArrayList<SectionedRoomListItem>>()
    val roomList: LiveData<ArrayList<SectionedRoomListItem>> = _roomList

    private val _createRoomResult = MutableLiveData<RoomResult>()
    val createRoomResult: LiveData<RoomResult> = _createRoomResult

    private val _joinedRoomResult = MutableLiveData<RoomResult>()
    val joinedRoomResult: LiveData<RoomResult> = _joinedRoomResult

    private val _deletedRoomResult = MutableLiveData<RoomResult>()
    val deletedRoomResult: LiveData<RoomResult> = _deletedRoomResult

    private val _leaveRoomResult = MutableLiveData<RoomResult>()
    val leaveRoomResult: LiveData<RoomResult> = _leaveRoomResult

    fun getUnjoinedRoomListData(username: String) {
        val userRoomRequest = UserRequest(username)
        RequestService.retrofitService.getUnjoinedRoomListData(userRoomRequest)
            .enqueue(object : Callback<RoomListResponse> {
                override fun onResponse(
                    call: Call<RoomListResponse>,
                    response: Response<RoomListResponse>
                ) {
                    if (response.code() == 200) {
                        val rooms = ArrayList(response.body()!!.rooms)
                        _roomList.value =
                            hideUnjoinableTeams(rooms) as ArrayList<SectionedRoomListItem>
                    } else {
                        // TODO("Not yet implemented")
                        println("Couldn't get rooms list")
                    }
                }

                override fun onFailure(call: Call<RoomListResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to get rooms list")
                    println(t.message)
                }
            })
    }

    fun getUserRoomListData(username: String) {
        val userRoomRequest = UserRequest(username)
        RequestService.retrofitService.getJoinedRoomListData(userRoomRequest)
            .enqueue(object : Callback<RoomListResponse> {
                override fun onResponse(
                    call: Call<RoomListResponse>,
                    response: Response<RoomListResponse>
                ) {
                    if (response.code() == 200) {
                        val rooms = ArrayList(response.body()!!.rooms)
                        _roomList.value = groupRooms(rooms) as ArrayList<SectionedRoomListItem>
                    } else {
                        // TODO("Not yet implemented")
                        println("Couldn't get rooms list")
                    }
                }

                override fun onFailure(call: Call<RoomListResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to get rooms list")
                    println(t.message)
                }
            })
    }

    private fun groupRooms(rooms: ArrayList<Room>): List<SectionedRoomListItem> {
        val drawingRoom = arrayListOf<SectionedRoomListItem>()
        val teamRooms = arrayListOf<SectionedRoomListItem>()
        val regularRooms = arrayListOf<SectionedRoomListItem>()

        rooms.forEach { room ->
            when {
                room.name.startsWith(ROOM_DRAWING_PREFIX) -> {
                    drawingRoom.add(room)
                }
                room.name.startsWith(ROOM_TEAM_PREFIX) -> {
                    teamRooms.add(room)
                }
                else -> {
                    regularRooms.add(room)
                }
            }
        }


        if (drawingRoom.isNotEmpty())
            drawingRoom.add(0, RoomSection("Canal du dessin"))

        if (teamRooms.isNotEmpty())
            teamRooms.add(0, RoomSection("Canaux d'équipes"))

        if (regularRooms.isNotEmpty())
            regularRooms.add(0, RoomSection("Canaux réguliers"))

        return drawingRoom + teamRooms + regularRooms
    }

    private fun hideUnjoinableTeams(rooms: ArrayList<Room>): List<SectionedRoomListItem> {
        return rooms.filter { room ->
            !(room.name.startsWith(ROOM_DRAWING_PREFIX)) && !(room.name.startsWith(ROOM_TEAM_PREFIX))
        }
    }

    fun createRoom(username: String, roomName: String) {
        val roomRequest = RoomRequest(username, roomName)
        RequestService.retrofitService.createRoom(roomRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        _createRoomResult.value = RoomResult(true)
                    } else {
                        // TODO("Not yet implemented")
                        println("Failed to add room")
                        _createRoomResult.value = RoomResult(false)
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to add room")
                    _createRoomResult.value = RoomResult(false)
                }
            })
    }

    fun joinRoom(roomName: String, username: String) {
        val roomRequest = RoomRequest(username, roomName)
        RequestService.retrofitService.joinRoom(roomRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        _joinedRoomResult.value = RoomResult(true)
                        getUnjoinedRoomListData(username)
                    } else {
                        _joinedRoomResult.value = RoomResult(false)
                        println("couldn't not join room")
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                        println(response.code())
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    _joinedRoomResult.value = RoomResult(false)
                    println("failure join room")
                    TODO("Not yet implemented")
                }
            })
    }

    fun deleteRoom(roomName: String, username: String) {
        val roomRequest = RoomRequest(username, roomName)
        RequestService.retrofitService.deleteRoom(roomRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        _deletedRoomResult.value = RoomResult(true)
                        getUserRoomListData(username)
                    } else {
                        _deletedRoomResult.value = RoomResult(false)
                        println("Could not delete room")
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                        println(response.code())
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    _deletedRoomResult.value = RoomResult(false)
                    println("Failure to delete room")
                    TODO("Not yet implemented")
                }
            })
    }

    fun leaveRoom(roomName: String, username: String) {
        val roomRequest = RoomRequest(username, roomName)
        RequestService.retrofitService.leaveRoom(roomRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        _leaveRoomResult.value = RoomResult(true)
                        getUserRoomListData(username)
                    } else {
                        println("Could not leave room")
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                        println(response.code())
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    println("Failure to leave room")
                    // TODO("Not yet implemented")
                }
            })
    }

    fun getMessageRoom(messageJson: String, username: String): String {
        val messageReceived: MessageSocketRequest =
            RequestService.convertJson(
                messageJson,
                MessageSocketRequest::class.java
            ) as MessageSocketRequest

        return messageReceived.room
    }
}