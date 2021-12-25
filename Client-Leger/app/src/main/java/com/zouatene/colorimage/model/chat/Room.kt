package com.zouatene.colorimage.model.chat

data class Room(
    var name: String,
    val owner: String,
    val password: String? = null,
    val history: List<Message>,
    val users: List<String>,
    val connectedUsers: List<String>,
    var unread: Int = 0
) : SectionedRoomListItem(TYPE_ROOM_ITEM)

data class RoomSection(
    val title: String,
) : SectionedRoomListItem(TYPE_ROOM_SECTION)

