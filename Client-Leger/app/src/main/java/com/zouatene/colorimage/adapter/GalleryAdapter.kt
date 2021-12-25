package com.zouatene.colorimage.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.model.IDrawing
import com.zouatene.colorimage.model.Privacy
import com.squareup.picasso.Picasso
import com.zouatene.colorimage.utils.Constants
import de.hdodenhof.circleimageview.CircleImageView

class GalleryAdapter(private val onItemClickListener: OnItemClickListener) :
    RecyclerView.Adapter<GalleryAdapter.GalleryItemViewHolder>() {
    var drawingList = ArrayList<IDrawing>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GalleryItemViewHolder {
        var view =
            LayoutInflater.from(parent.context).inflate(R.layout.gallery_item_layout, parent, false)

        return GalleryItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: GalleryItemViewHolder, position: Int) {
        var drawing = drawingList[position]
        holder.bind(drawing)

        holder.drawingCard.setOnClickListener {
            onItemClickListener.onItemClick(position)
        }
    }

    override fun getItemCount(): Int = drawingList.size

    class GalleryItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val drawingCard: MaterialCardView = itemView.findViewById(R.id.drawingCard)
        private val drawingTitle: TextView = itemView.findViewById(R.id.drawingTitleInput)
        private val lockIcon: ImageView = itemView.findViewById(R.id.lockIcon)
        private val drawingAuthor: TextView = itemView.findViewById(R.id.drawingAuthor)
        private val drawingNbCollab: TextView = itemView.findViewById(R.id.drawingNbCollab)
        private val drawingCreationDate: TextView = itemView.findViewById(R.id.drawingCreationDate)
        private val previewImage: ImageView = itemView.findViewById(R.id.previewImage)
        private val authorAvatar: CircleImageView = itemView.findViewById(R.id.authorAvatar)

        fun bind(drawing: IDrawing) {
            drawingTitle.text = drawing.name
            drawingAuthor.text = drawing.owner
            if (drawing.nbCollaborateurs != null) {
                // this line exists because zero would be considered plural
                val quantityValue =
                    if (drawing.nbCollaborateurs == 0) 1 else drawing.nbCollaborateurs
                drawingNbCollab.text = itemView.context.resources.getQuantityString(
                    R.plurals.numberCollaborators,
                    quantityValue,
                    drawing.nbCollaborateurs
                )
            } else {
                drawingNbCollab.text = itemView.context.getString(R.string.noInformation)
            }
            if (drawing.creationTimestamp != null) {
                val sdf = java.text.SimpleDateFormat("dd/MM/yyyy")
                val date = java.util.Date((drawing.creationTimestamp * 1000).toLong())
                drawingCreationDate.text = sdf.format(date)
            } else {
                drawingCreationDate.text = "N/A"
            }

            lockIcon.visibility = when (drawing.privacy) {
                Privacy.PROTECTED -> View.VISIBLE
                else -> View.GONE
            }
            Picasso.get().load(drawing.preview).into(previewImage)

            if (drawing.team == null) {
                Picasso.get().load(drawing.avatar).into(authorAvatar)
            } else {
                Picasso.get().load(Constants.AUTHOR_TEAM_AVATAR).into(authorAvatar)
            }
        }
    }
}