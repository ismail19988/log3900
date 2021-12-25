package com.zouatene.colorimage.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.adapter.TeamAdapter
import com.zouatene.colorimage.databinding.FragmentTeamBinding
import com.zouatene.colorimage.viewmodel.TeamViewModel

class TeamFragment : Fragment() {
    private lateinit var binding: FragmentTeamBinding
    private lateinit var adapter: TeamAdapter
    private lateinit var teamViewModel: TeamViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_team, container, false)

        adapter = TeamAdapter(requireContext())
        binding.teamsRecyclerView.adapter = adapter

        val loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()

        teamViewModel = TeamViewModel()
        teamViewModel.getJoinedTeamList(loggedUser.username)

        teamViewModel.teamList.observe(viewLifecycleOwner, Observer {
            val teamList = it ?: return@Observer
            adapter.teamList = teamList

            binding.noTeamsText.visibility = when (teamList.size) {
                0 -> View.VISIBLE
                else -> View.GONE
            }
        })

        return binding.root
    }
}