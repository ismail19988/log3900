package com.zouatene.colorimage.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.team.Team
import com.zouatene.colorimage.model.team.TeamUser

class TeamAdapter(private val context: Context) :
    RecyclerView.Adapter<TeamAdapter.TeamItemViewHolder>() {
    var teamList = ArrayList<Team>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TeamItemViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater
            .inflate(R.layout.team_list_item_layout, parent, false)

        return TeamItemViewHolder(context, view)
    }

    override fun onBindViewHolder(holder: TeamItemViewHolder, position: Int) {
        val team = teamList[position]
        holder.bind(team)
    }

    override fun getItemCount(): Int = teamList.size

    class TeamItemViewHolder(
        private val context: Context,
        itemView: View,
    ) : RecyclerView.ViewHolder(itemView) {
        private val teamCard: MaterialCardView = itemView.findViewById(R.id.teamCard)
        private val teamName: TextView = itemView.findViewById(R.id.teamName)
        private val nbUsers: TextView = itemView.findViewById(R.id.nbUsers)
        private val expandIcon: ImageView = itemView.findViewById(R.id.expandIcon)
        private val expandableView: LinearLayout = itemView.findViewById(R.id.expandableView)
        private val teamBio: TextView = itemView.findViewById(R.id.teamBio)
        private val teamUserListRecyclerView: RecyclerView =
            itemView.findViewById(R.id.teamUserListRecyclerView)

        fun bind(team: Team) {
            teamName.text = team.name
            nbUsers.text = "${team.users.size} / ${team.maxUsers}"
            teamBio.text = team.bio

            teamCard.setOnClickListener {
                toggleExpandableView()
            }

            val adapter = TeamUserListAdapter()
            teamUserListRecyclerView.adapter = adapter

            adapter.userList = team.users as ArrayList<TeamUser>

//            team.status.forEach {
//                println("key: " + it.key)
//                println("value: " + it.value)
//            }
        }

        private fun toggleExpandableView() {
            if (expandableView.visibility == View.GONE) {
                expandIcon.setImageDrawable(
                    ResourcesCompat.getDrawable(
                        context.resources,
                        R.drawable.expand_less,
                        null
                    )
                )
                expandableView.visibility = View.VISIBLE
            } else {
                expandIcon.setImageDrawable(
                    ResourcesCompat.getDrawable(
                        context.resources,
                        R.drawable.expand_more,
                        null
                    )
                )
                expandableView.visibility = View.GONE
            }
        }
    }
}