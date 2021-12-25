package com.zouatene.colorimage.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.squareup.picasso.Picasso
import com.zouatene.colorimage.utils.MessageOwner
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.chat.ChatMessage

class MessageAdapter : RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {

    var messageList = ArrayList<ChatMessage>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun getItemViewType(position: Int): Int {
        return messageList[position].messageOwner.value
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val layoutId = when (viewType) {
            MessageOwner.SENDER.value -> R.layout.sender_chat_layout
            else -> R.layout.receiver_chat_layout
        }

        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater
            .inflate(layoutId, parent, false)

        return MessageViewHolder(view)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val message = messageList[position]
        holder.bind(message)
    }

    override fun getItemCount(): Int = messageList.size


    class MessageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val content: TextView = itemView.findViewById(R.id.message)
        private val timestamp: TextView = itemView.findViewById(R.id.messageTimestamp)
        private val username: TextView = itemView.findViewById(R.id.messageSender)
        private val avatar: ImageView = itemView.findViewById(R.id.avatar)

        fun bind(message: ChatMessage) {
            content.text = message.message.content
            val sdf = java.text.SimpleDateFormat("HH:mm:ss")
            val date = java.util.Date((message.message.timestamp * 1000).toLong())
            timestamp.text = "[${sdf.format(date)}]"
            username.text = message.message.sender
            Picasso.get().load(message.message.avatar).into(avatar)
        }
    }
}