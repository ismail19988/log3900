package com.zouatene.colorimage.dialog

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.Observer
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentChangePasswordDialogBinding
import com.zouatene.colorimage.viewmodel.ChangePasswordDialogViewModel
import com.zouatene.colorimage.viewmodel.RegisterViewModel
import java.lang.ClassCastException

class ChangePasswordDialogFragment : DialogFragment() {
    interface EditPasswordDialogListener {
        fun onSuccessEditPasswordDialog(password: String)
    }

    private lateinit var editPasswordDialogListener: EditPasswordDialogListener
    private lateinit var binding: FragmentChangePasswordDialogBinding
    private lateinit var changePasswordDialogViewModel: ChangePasswordDialogViewModel
    private lateinit var registerViewModel: RegisterViewModel
    private lateinit var oldPassword: String

    override fun onAttach(context: Context) {
        super.onAttach(context)
        try {
            editPasswordDialogListener =
                parentFragment as EditPasswordDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement ChangePasswordDialogFragment")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_change_password_dialog,
            container,
            false
        )

        val oldPasswordInput = binding.oldPasswordInput
        val newPasswordInput = binding.newPasswordInput

        val bundle = this.arguments
        if (bundle != null) {
            oldPassword = bundle.get("password") as String
        }

        changePasswordDialogViewModel = ChangePasswordDialogViewModel()
        registerViewModel = RegisterViewModel(requireContext())

        binding.confirmButton.setOnClickListener {
            editPasswordDialogListener.onSuccessEditPasswordDialog(newPasswordInput.text.toString())
        }

        binding.cancelButton.setOnClickListener {
            dismiss()
        }

        oldPasswordInput.doAfterTextChanged {
            changePasswordDialogViewModel.checkOldPasswordValid(
                oldPasswordInput.text.toString(),
                oldPassword
            )
        }

        changePasswordDialogViewModel.oldPasswordError.observe(viewLifecycleOwner, Observer {
            val oldPasswordError = it ?: return@Observer
            binding.oldPasswordLayout.error = oldPasswordError
            checkEnableConfirmButton()
        })

        newPasswordInput.doAfterTextChanged {
            registerViewModel.checkPasswordValid(binding.newPasswordInput.text.toString())
        }

        registerViewModel.passwordErrors.observe(viewLifecycleOwner, Observer {
            val passwordErrorsState = it ?: return@Observer
            val circle = "\u25CF"
            val errorString =
                if (passwordErrorsState.isNotEmpty()) circle + passwordErrorsState.joinToString(
                    "\n$circle"
                )
                else null
            binding.newPasswordLayout.error = errorString
            checkEnableConfirmButton()
        })

        return binding.root
    }

    private fun checkEnableConfirmButton() {
        binding.confirmButton.isEnabled =
            binding.oldPasswordLayout.error.isNullOrBlank() && binding.newPasswordLayout.error.isNullOrBlank()
    }
}