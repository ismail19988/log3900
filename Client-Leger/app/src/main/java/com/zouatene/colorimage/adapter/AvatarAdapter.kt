package com.zouatene.colorimage.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.squareup.picasso.Picasso
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.access.DefaultAvatar
import de.hdodenhof.circleimageview.CircleImageView

class AvatarAdapter() :
    RecyclerView.Adapter<AvatarAdapter.ViewHolder>() {

    var avatarList = emptyList<DefaultAvatar>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }
    var selectedItemIndex = -1

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        var view =
            LayoutInflater.from(parent.context).inflate(R.layout.avatar_layout, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        var avatar = avatarList[position]
        Picasso.get().load(avatar.avatar).into(holder.image)
        holder.itemView.setOnClickListener {
            selectedItemIndex = holder.absoluteAdapterPosition
            notifyDataSetChanged()
        }

        if (position == selectedItemIndex) {
            holder.image.borderWidth = 10
            holder.check.visibility = View.VISIBLE
        } else {
            holder.image.borderWidth = 0
            holder.check.visibility = View.INVISIBLE
        }
    }

    override fun getItemCount(): Int = avatarList.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var image: CircleImageView = itemView.findViewById(R.id.avatar)
        var check: ImageView = itemView.findViewById(R.id.check)
    }
}