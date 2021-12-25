package com.zouatene.colorimage.access

import android.app.Dialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import androidx.core.widget.doAfterTextChanged
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.navigation.findNavController
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentRegisterBinding
import com.zouatene.colorimage.model.IUser
import com.zouatene.colorimage.viewmodel.AvatarCollectionsDialogViewModel
import com.zouatene.colorimage.viewmodel.RegisterViewModel

class RegisterFragment : Fragment() {

    /*
    PRIVATE VARIABLES
     */
    private lateinit var binding: FragmentRegisterBinding
    private lateinit var registerViewModel: RegisterViewModel
    private lateinit var loadingDialog: Dialog

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_register, container, false)
        registerViewModel = RegisterViewModel(requireContext())

        val avatarFragment = AvatarFragment()

        val avatarCollectionsDialogViewModel: AvatarCollectionsDialogViewModel by activityViewModels()
        avatarCollectionsDialogViewModel.mapAvatars()
        registerViewModel.avatar = avatarCollectionsDialogViewModel.avatarUrlMap[0]!!

        parentFragmentManager.beginTransaction()
            .replace(binding.avatarFragmentContainer.id, avatarFragment).commit()

        avatarFragment.setAvatarSelectedListener(object : AvatarFragment.AvatarSelectedListener {
            override fun onPictureSelectedListener(avatarByteArray: ByteArray) {
                registerViewModel.avatar = avatarByteArray
            }

            override fun onDefaultAvatarSelectedListener(url: String) {
                registerViewModel.avatar = url
            }
        })

        val firstNameField = binding.firstNameFieldRegister
        val lastNameField = binding.lastNameFieldRegister
        val emailField = binding.emailFieldRegister
        val usernameField = binding.usernameFieldRegister
        val passwordField = binding.passwordFieldRegister
        val confirmPasswordField = binding.confirmPasswordFieldRegister

        firstNameField.doAfterTextChanged {
            registerViewModel.checkFirstNameValid(firstNameField.text.toString())
        }
        registerViewModel.firstNameError.observe(viewLifecycleOwner, Observer {
            val firstNameError = it ?: return@Observer
            binding.firstNameLayoutRegister.error = firstNameError
        })

        lastNameField.doAfterTextChanged {
            registerViewModel.checkLastNameValid(lastNameField.text.toString())
        }

        registerViewModel.lastNameError.observe(viewLifecycleOwner, Observer {
            val lastNameError = it ?: return@Observer
            binding.lastNameLayoutRegister.error = lastNameError
        })

        emailField.doAfterTextChanged {
            registerViewModel.checkEmailValid(emailField.text.toString())
        }

        registerViewModel.emailError.observe(viewLifecycleOwner, Observer {
            val emailError = it ?: return@Observer
            binding.emailLayoutRegister.error = emailError
        })

        usernameField.doAfterTextChanged {
            registerViewModel.checkUsernameValid(usernameField.text.toString())
        }

        registerViewModel.usernameError.observe(viewLifecycleOwner, Observer {
            val usernameError = it ?: return@Observer
            binding.usernameLayoutRegister.error = usernameError
        })

        passwordField.doAfterTextChanged {
            registerViewModel.checkPasswordValid(passwordField.text.toString())
        }
        registerViewModel.passwordErrors.observe(viewLifecycleOwner, Observer {
            val passwordErrorsState = it ?: return@Observer
            val circle = "\u25CF"
            val errorString =
                if (passwordErrorsState.isNotEmpty()) circle + passwordErrorsState.joinToString(
                    "\n$circle"
                )
                else null
            binding.passwordLayoutRegister.error = errorString
        })

        confirmPasswordField.doAfterTextChanged {
            registerViewModel.checkConfirmPasswordValid(
                passwordField.text.toString(),
                confirmPasswordField.text.toString()
            )
        }

        registerViewModel.confirmPasswordError.observe(viewLifecycleOwner, Observer {
            val confirmPasswordError = it ?: return@Observer
            binding.confirmPasswordLayoutRegister.error = confirmPasswordError
        })

        binding.signUpButton.setOnClickListener {
            // submit form
            binding.textErrorRegister.visibility = View.INVISIBLE
            val user = IUser(
                email = emailField.text.toString(),
                password = passwordField.text.toString(),
                firstname = firstNameField.text.toString(),
                lastname = lastNameField.text.toString(),
                username = usernameField.text.toString(),
                avatar = registerViewModel.avatar
            )

            if (registerViewModel.isAllInfoValid(user,confirmPasswordField.text.toString())) {
                loadingDialog = Dialog(requireContext())
                loadingDialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
                loadingDialog.setContentView(R.layout.progress_bar_layout)
                loadingDialog.setCancelable(true)
                loadingDialog.setCanceledOnTouchOutside(true)
                loadingDialog.show()
                registerViewModel.signup(user, confirmPasswordField.text.toString())
            }


        }
        registerViewModel.registerResult.observe(viewLifecycleOwner, Observer {
            dismissLoadingDialog()
            val registerResultState = it ?: return@Observer
            if (registerResultState.success) {
                binding.root.findNavController()
                    .navigate(R.id.action_registerFragment_to_loginFragment)
            } else {
                binding.textErrorRegister.text = registerResultState.errorText
                binding.textErrorRegister.visibility = View.VISIBLE
            }
        })
        binding.backButton.setOnClickListener {
            activity?.onBackPressed()
        }

        return binding.root
    }

    private fun dismissLoadingDialog(){
        if(loadingDialog.isShowing) {
            loadingDialog.dismiss()
        }
    }
}