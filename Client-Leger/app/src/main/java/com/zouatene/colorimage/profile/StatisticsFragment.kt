package com.zouatene.colorimage.profile

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentStatisticsBinding
import com.zouatene.colorimage.viewmodel.ProfileViewModel
import java.util.*
import java.util.concurrent.TimeUnit





class StatisticsFragment : Fragment() {
    private lateinit var binding: FragmentStatisticsBinding
    private lateinit var profileViewModel: ProfileViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_statistics, container, false)
        profileViewModel = ProfileViewModel(requireContext())
        val loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()
        profileViewModel.userDataResult.observe(viewLifecycleOwner, Observer {
            val userDataResult = it ?: return@Observer

            if (userDataResult.success) {
                val data = userDataResult.userData
                changeTextToPluralStats(binding.nbDessinCollaborate, R.plurals.numberDrawing, data.nb_collaborations)
                changeTextToPluralStats(binding.nbDessinCree, R.plurals.numberDrawing, data.nb_ownership)
                changeTextToPluralStats(binding.nbEquipe, R.plurals.numberTeams, data.nb_teams)
                changeTextToTimeStats(binding.meanTimeText, data.average_collab_time)
                changeTextToTimeStats(binding.totalTimeText, data.totalTimeCollab)
            }
        })
        profileViewModel.getUserData(loggedUser.username)

        binding.backButton.setOnClickListener {
            activity?.onBackPressed()
        }
        return binding.root

    }



    private fun changeTextToPluralStats(textView: TextView, pluralId: Int, value: Int?){
        if(value != null) {
            // this line exists because zero would be considered plural
            val quantityValue = if(value == 0) 1 else value
            textView.text = resources.getQuantityString(pluralId, quantityValue, value)
        } else {
            textView.text = getString(R.string.noInformation)
        }
    }

    @SuppressLint("SimpleDateFormat")
    private fun changeTextToTimeStats(textView: TextView, value: Double?){
        if(value != null ) {
            var duration = value.toLong()
            val hours = TimeUnit.MILLISECONDS.toHours(duration)
            duration -= TimeUnit.HOURS.toMillis(hours)
            val minutes = TimeUnit.MILLISECONDS.toMinutes(duration)
            duration -= TimeUnit.MINUTES.toMillis(minutes)
            val seconds = TimeUnit.MILLISECONDS.toSeconds(duration)
            val time = String.format("%02d:%02d:%02d",
                hours,minutes, seconds
            )
            textView.text = time
        } else {
            textView.text = getString(R.string.noInformation)
        }
    }



}