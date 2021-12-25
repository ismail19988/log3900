package com.zouatene.colorimage.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentProfileBinding
import com.zouatene.colorimage.profile.AccountHistoryFragment
import com.zouatene.colorimage.profile.AccountSettingsFragment
import com.zouatene.colorimage.profile.StatisticsFragment

class ProfileFragment : Fragment() {
    private lateinit var binding: FragmentProfileBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_profile, container, false)

        binding.accountSettingsCard.setOnClickListener {
            parentFragmentManager.beginTransaction().replace(this.id, AccountSettingsFragment()).addToBackStack(null).commit()
        }

        binding.statisticCard.setOnClickListener {
            parentFragmentManager.beginTransaction().replace(this.id, StatisticsFragment()).addToBackStack(null).commit()
        }

        binding.historyCard.setOnClickListener {
            parentFragmentManager.beginTransaction().replace(this.id, AccountHistoryFragment()).addToBackStack(null).commit()
        }
        return binding.root
    }

}