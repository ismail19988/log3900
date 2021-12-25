package com.zouatene.colorimage.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.team.TeamUser
import com.zouatene.colorimage.utils.Constants

class TeamUserListAdapter : RecyclerView.Adapter<TeamUserListAdapter.TeamUserListItemViewHolder>() {
    var userList = ArrayList<TeamUser>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TeamUserListItemViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater
            .inflate(R.layout.team_user_list_item_layout, parent, false)

        return TeamUserListItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: TeamUserListItemViewHolder, position: Int) {
        val user = userList[position].user
        val colorStatus = Constants.statusMap[userList[position].status ?: ""]
        holder.bind(user, colorStatus ?: Color.GRAY)
    }

    override fun getItemCount(): Int = userList.size

    class TeamUserListItemViewHolder(
        itemView: View,
    ) : RecyclerView.ViewHolder(itemView) {
        private val username: TextView = itemView.findViewById(R.id.username)
        private val status: ImageView = itemView.findViewById(R.id.status_circle)
        fun bind(user: String, statusColor: Int) {
            username.text = user
            status.setColorFilter(statusColor)
        }
    }
}