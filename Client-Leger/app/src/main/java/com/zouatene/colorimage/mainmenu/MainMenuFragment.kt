package com.zouatene.colorimage.mainmenu

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.activity.AccessActivity
import com.zouatene.colorimage.databinding.FragmentMainMenuBinding
import com.zouatene.colorimage.utils.MainMenuTabs

class MainMenuFragment : Fragment() {
    private lateinit var binding: FragmentMainMenuBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_main_menu, container, false)

        val loggedUser = LoggedUserManager(requireContext())

        binding.galleryCard.setOnClickListener {
            changeTab(MainMenuTabs.Gallery)
        }
        binding.teamCard.setOnClickListener {
            changeTab(MainMenuTabs.Teams)
        }
        binding.profileCard.setOnClickListener {
            changeTab(MainMenuTabs.Profile)
        }

        binding.logoutCard.setOnClickListener {
            loggedUser.clearUserData()
            val intent = Intent(requireView().context, AccessActivity::class.java)
            intent.flags =
                Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        changeTab(MainMenuTabs.Gallery)

        return binding.root
    }

    private fun changeTab(tab: MainMenuTabs) {
        var galleryCardColor = R.color.purple_500
        var teamCardColor = R.color.purple_500
        var profileCardColor = R.color.purple_500
        val fragment: Fragment

        when (tab) {
            MainMenuTabs.Gallery -> {
                fragment = GalleryFragment()
                galleryCardColor = R.color.purple_800
            }
            MainMenuTabs.Teams -> {
                fragment = TeamFragment()
                teamCardColor = R.color.purple_800
            }
            MainMenuTabs.Profile -> {
                fragment = ProfileFragment()
                profileCardColor = R.color.purple_800
            }
        }
        parentFragmentManager.beginTransaction()
            .replace(binding.fragmentContainerView.id, fragment).commit()

        binding.galleryCard.setBackgroundColor(
            requireActivity().resources.getColor(
                galleryCardColor,
                null
            )
        )

        binding.teamCard.setBackgroundColor(
            requireActivity().resources.getColor(
                teamCardColor,
                null
            )
        )
        binding.profileCard.setBackgroundColor(
            requireActivity().resources.getColor(
                profileCardColor,
                null
            )
        )
    }
}