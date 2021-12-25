package com.zouatene.colorimage.profile

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.zouatene.colorimage.*
import com.zouatene.colorimage.access.AvatarFragment
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.databinding.FragmentAccountSettingsBinding
import com.zouatene.colorimage.dialog.ChangePasswordDialogFragment
import com.zouatene.colorimage.dialog.ChangeUsernameDialogFragment
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.viewmodel.ProfileViewModel

class AccountSettingsFragment : Fragment(),
    ChangePasswordDialogFragment.EditPasswordDialogListener,
    ChangeUsernameDialogFragment.EditUsernameDialogListener {
    private lateinit var binding: FragmentAccountSettingsBinding
    private lateinit var profileViewModel: ProfileViewModel
    private lateinit var loggedUser: LoggedUser
    private lateinit var passwordDialog: ChangePasswordDialogFragment
    private lateinit var usernameDialog: ChangeUsernameDialogFragment

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_account_settings, container, false)

        val avatarFragment = AvatarFragment()
        parentFragmentManager.beginTransaction()
            .replace(binding.avatarFragmentContainer.id, avatarFragment).commit()

        binding.avatarFragmentContainer.visibility = View.INVISIBLE

        profileViewModel = ProfileViewModel(requireContext())
        loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()

        profileViewModel.userDataResult.observe(viewLifecycleOwner, Observer {
            val userDataResult = it ?: return@Observer

            if (userDataResult.success) {
                val data = userDataResult.userData
                binding.email.text = data.email
                binding.firstName.text = data.firstname
                binding.lastName.text = data.lastname
                binding.username.text = data.username
                binding.password.text = data.password
                binding.emailPublicSwitch.isChecked = data.isEmailPublic!!
                binding.namePublicSwitch.isChecked = data.isNamePublic!!
                val callback = {
                    binding.avatarFragmentContainer.visibility = View.VISIBLE
                }
                avatarFragment.setAvatarImage(data.avatar!!, callback)
            }
        })

        binding.editUsernameButton.setOnClickListener { createEditUsernameDialog() }
        binding.editPasswordButton.setOnClickListener { createEditPasswordDialog() }
        binding.emailPublicSwitch.setOnCheckedChangeListener { _, isChecked ->
            profileViewModel.updateEmailPrivacy(
                loggedUser.username,
                isChecked
            )
        }
        binding.namePublicSwitch.setOnCheckedChangeListener { _, isChecked ->
            profileViewModel.updateNamePrivacy(
                loggedUser.username,
                isChecked
            )
        }

        profileViewModel.getUserData(loggedUser.username)

        avatarFragment.setAvatarSelectedListener(object : AvatarFragment.AvatarSelectedListener {
            override fun onPictureSelectedListener(avatarByteArray: ByteArray) {
                profileViewModel.updateAvatar(loggedUser.username, avatarByteArray)
            }

            override fun onDefaultAvatarSelectedListener(url: String) {
                profileViewModel.updateAvatar(loggedUser.username, url)
            }
        })

        binding.backButton.setOnClickListener {
            activity?.onBackPressed()
        }

        return binding.root
    }

    private fun createEditUsernameDialog() {
        usernameDialog = ChangeUsernameDialogFragment()
        usernameDialog.show(childFragmentManager, null)
    }

    override fun onSuccessEditUsernameDialog(newUsername: String) {
        profileViewModel.updateUsername(loggedUser.username, newUsername)
        usernameDialog.dismiss()
    }

    private fun createEditPasswordDialog() {
        passwordDialog = ChangePasswordDialogFragment()
        val bundle = Bundle()
        bundle.putString("password", binding.password.text.toString())
        passwordDialog.arguments = bundle
        passwordDialog.show(childFragmentManager, null)
    }

    override fun onSuccessEditPasswordDialog(password: String) {
        profileViewModel.updatePassword(loggedUser.username, password)
        passwordDialog.dismiss()
    }
}