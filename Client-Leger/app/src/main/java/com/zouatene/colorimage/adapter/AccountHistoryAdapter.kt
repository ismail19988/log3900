package com.zouatene.colorimage.adapter

import android.content.Context
import android.graphics.Paint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.zouatene.colorimage.utils.ActionType
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.drawelement.Action

import androidx.core.content.res.ResourcesCompat
import com.google.android.material.card.MaterialCardView
import com.zouatene.colorimage.chat.OnItemClickListener


class AccountHistoryAdapter(private val context: Context, private val onItemClickListener: OnItemClickListener) :
    RecyclerView.Adapter<AccountHistoryAdapter.AccountHistoryItemViewHolder>() {

    var actionList = ArrayList<Action>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): AccountHistoryItemViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater
            .inflate(R.layout.account_history_item_layout, parent, false)

        return AccountHistoryItemViewHolder(context, view)
    }

    override fun onBindViewHolder(holder: AccountHistoryItemViewHolder, position: Int) {
        val action = actionList[position]
        holder.bind(action)

        holder.actionCard.setOnClickListener {
            onItemClickListener.onItemClick(position)
        }
    }

    override fun getItemCount(): Int = actionList.size

    class AccountHistoryItemViewHolder(
        private val context: Context,
        itemView: View
    ) : RecyclerView.ViewHolder(itemView) {
        val actionCard: MaterialCardView = itemView.findViewById(R.id.actionCard)
        private val actionName: TextView = itemView.findViewById(R.id.actionName)
        private val drawingName: TextView = itemView.findViewById(R.id.drawingName)
        private val actionIcon: ImageView = itemView.findViewById(R.id.actionIcon)
        private val actionTimestamp: TextView = itemView.findViewById(R.id.actionTimestamp)
        private val goToDrawingIcon: ImageView = itemView.findViewById(R.id.goToDrawingIcon)

        fun bind(action: Action) {
            val sdf = java.text.SimpleDateFormat("dd/MMM/yyyy\nHH:mm:ss")
            val date = java.util.Date((action.timestamp).toLong())
            actionTimestamp.text = sdf.format(date)

            goToDrawingIcon.visibility = View.INVISIBLE
            drawingName.visibility = View.GONE
            actionCard.isEnabled = false
            when (action.action) {
                ActionType.LOGIN.value -> {
                    actionName.text = "Connexion"
                    actionIcon.setImageDrawable(ResourcesCompat.getDrawable(context.resources, R.drawable.login, null))
                }
                ActionType.LOGOUT.value -> {
                    actionName.text = "Déconnexion"
                    actionIcon.setImageDrawable(ResourcesCompat.getDrawable(context.resources, R.drawable.logout, null))
                }
                ActionType.JOIN_DRAWING.value -> {
                    actionName.text = "Éditer le dessin : "
                    drawingName.text = action.drawing
                    drawingName.paintFlags = drawingName.paintFlags or Paint.UNDERLINE_TEXT_FLAG
                    goToDrawingIcon.visibility = View.VISIBLE
                    drawingName.visibility = View.VISIBLE
                    actionIcon.setImageDrawable(ResourcesCompat.getDrawable(context.resources, R.drawable.edit, null))
                    actionCard.isEnabled = true
                }
            }
        }
    }
}