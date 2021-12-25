package com.zouatene.colorimage.adapter

import android.content.Context
import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import androidx.recyclerview.widget.RecyclerView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.tools.Tool
import kotlin.collections.ArrayList

class ToolListAdapter(
    private val context: Context,
    private val onItemClickListener: OnItemClickListener
) :
    RecyclerView.Adapter<ToolListAdapter.ToolItemViewHolder>() {

    var selectedItemIndex = 1
    var toolList = ArrayList<Tool>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ToolItemViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater
            .inflate(R.layout.tool_list_item_layout, parent, false)

        return ToolItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ToolItemViewHolder, position: Int) {
        val tool = toolList[position]
        holder.toolIcon.setOnClickListener {
            onItemClickListener.onItemClick(position)
        }
        if (selectedItemIndex == position) {
            holder.toolIcon.backgroundTintList =
                ColorStateList.valueOf(context.resources.getColor(R.color.purple_700, null))
        } else {
            holder.toolIcon.backgroundTintList =
                ColorStateList.valueOf(context.resources.getColor(R.color.purple_500, null))
        }
        holder.bind(tool)
    }

    override fun getItemCount(): Int = toolList.size

    fun getCurrentTool(): Tool {
        return toolList[selectedItemIndex]
    }

    class ToolItemViewHolder(
        itemView: View,
    ) : RecyclerView.ViewHolder(itemView) {
        val toolIcon: ImageButton = itemView.findViewById(R.id.toolIcon)

        fun bind(tool: Tool) {
            toolIcon.setImageResource(tool.icon)
        }
    }
}