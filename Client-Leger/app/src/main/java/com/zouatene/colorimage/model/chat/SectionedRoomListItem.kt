package com.zouatene.colorimage.model.chat

open class SectionedRoomListItem(
    val type: Int
) {
    companion object {
        const val TYPE_ROOM_SECTION = 0
        const val TYPE_ROOM_ITEM = 1
    }
}