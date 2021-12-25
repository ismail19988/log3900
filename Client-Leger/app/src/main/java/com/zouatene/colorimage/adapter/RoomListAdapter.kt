package com.zouatene.colorimage.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.databinding.RoomListItemLayoutBinding
import com.zouatene.colorimage.databinding.RoomSectionItemLayoutBinding
import com.zouatene.colorimage.model.chat.Room
import com.zouatene.colorimage.model.chat.RoomSection
import com.zouatene.colorimage.model.chat.SectionedRoomListItem
import com.zouatene.colorimage.utils.Constants
import java.util.*
import kotlin.collections.ArrayList

class RoomListAdapter(
    private val context: Context, private val onItemClickListener: OnItemClickListener
) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    var selectedRoomName = "General"
    var isUnjoinedRoomList = false
    var roomListCopy = ArrayList<Room>()
    var isEditMode = false
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    var roomList = ArrayList<SectionedRoomListItem>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)

        return when (viewType) {
            SectionedRoomListItem.TYPE_ROOM_SECTION ->
                RoomSectionItemViewHolder(RoomSectionItemLayoutBinding.inflate(layoutInflater))
            else ->
                RoomItemViewHolder(RoomListItemLayoutBinding.inflate(layoutInflater))
        }
    }

    override fun getItemViewType(position: Int): Int {
        return roomList[position].type
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (holder.itemViewType) {
            SectionedRoomListItem.TYPE_ROOM_ITEM -> {
                val room = roomList[position]
                (holder as RoomItemViewHolder).bind(
                    room as Room,
                )

                if (isUnjoinedRoomList) {
                    holder.joinRoomIcon.visibility = View.VISIBLE
                    holder.roomCard.setCardBackgroundColor(
                        context.resources.getColor(
                            R.color.purple_500,
                            null
                        )
                    )
                    holder.removeRoomButton.visibility = View.GONE
                    holder.roomCard.setOnClickListener {
                        notifyDataSetChanged()
                        onItemClickListener.onItemClick(position)
                    }
                } else {
                    holder.joinRoomIcon.visibility = View.GONE
                    holder.roomCard.setOnClickListener {
                        if (isEditMode) {
                            onItemClickListener.onItemClick(position)
                            room.unread = 0
                            notifyDataSetChanged()
                        } else {
                            selectedRoomName = room.name
                            room.unread = 0
                            notifyDataSetChanged()
                            onItemClickListener.onItemClick(position)
                        }
                    }

                    if (room.name == selectedRoomName) {
                        holder.roomCard.setCardBackgroundColor(
                            context.resources.getColor(
                                R.color.purple_800,
                                null
                            )
                        )
                    } else {
                        holder.roomCard.setCardBackgroundColor(
                            context.resources.getColor(
                                R.color.purple_500,
                                null
                            )
                        )
                    }
                    if (isEditMode) {
                        holder.removeRoomButton.visibility = View.VISIBLE
                    } else {
                        holder.removeRoomButton.visibility = View.GONE
                    }
                }

                if (room.unread != 0 && !isUnjoinedRoomList && room.name != selectedRoomName) {
                    holder.unreadMessagesCount.text = room.unread.toString()
                    holder.unreadMessagesCount.visibility = View.VISIBLE
                } else {
                    holder.unreadMessagesCount.visibility = View.GONE
                }

                if (isEditMode && !isEditableRoom(room)) {
                    holder.itemView.visibility = View.GONE
                    holder.itemView.layoutParams = RecyclerView.LayoutParams(0, 0)
                } else {
                    holder.itemView.visibility = View.VISIBLE
                    holder.itemView.layoutParams =
                        RecyclerView.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.WRAP_CONTENT
                        )
                }
            }
            SectionedRoomListItem.TYPE_ROOM_SECTION -> (holder as RoomSectionItemViewHolder).bind(
                roomList[position] as RoomSection
            )
        }
    }

    private fun isEditableRoom(room: Room): Boolean {
        return room.name != "General"
                && !room.name.startsWith(Constants.ROOM_TEAM_PREFIX)
                && !room.name.startsWith(Constants.ROOM_DRAWING_PREFIX)
    }

    fun filter(text: String) {
        var text = text
        roomList.clear()
        if (text.isEmpty()) {
            roomList.addAll(roomListCopy)
        } else {
            text = text.lowercase(Locale.getDefault())
            for (item in roomListCopy) {
                if (item.name.lowercase(Locale.getDefault()).contains(text))
                    roomList.add(item)
            }
        }
        notifyDataSetChanged()
    }

    override fun getItemCount(): Int = roomList.size

    fun incrementUnreadBadge(messageRoom: String) {
        val roomToUpdate =
            roomList.first { room -> room.type == SectionedRoomListItem.TYPE_ROOM_ITEM && (room as Room).name == messageRoom } as Room
        roomToUpdate.unread = roomToUpdate.unread + 1
        notifyDataSetChanged()
    }

    class RoomItemViewHolder(
        val binding: RoomListItemLayoutBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        val roomCard: MaterialCardView = itemView.findViewById(R.id.roomCard)
        val joinRoomIcon: ImageView = itemView.findViewById(R.id.joinRoomButton)
        val removeRoomButton: ImageView = itemView.findViewById(R.id.removeRoomButton)
        val unreadMessagesCount: TextView = itemView.findViewById(R.id.unreadMessagesCount)
        private val roomName: TextView = itemView.findViewById(R.id.roomName)

        fun bind(room: Room) {
            roomName.text = when {
                room.name.startsWith(Constants.ROOM_TEAM_PREFIX) ->
                    room.name.drop(Constants.ROOM_TEAM_PREFIX.length)
                room.name.startsWith(Constants.ROOM_DRAWING_PREFIX) ->
                    room.name.drop(Constants.ROOM_DRAWING_PREFIX.length)
                else ->
                    room.name
            }
        }
    }

    class RoomSectionItemViewHolder(
        val binding: RoomSectionItemLayoutBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        private val sectionTitle: TextView = itemView.findViewById(R.id.sectionTitle)

        fun bind(section: RoomSection) {
            sectionTitle.text = section.title
        }
    }
}