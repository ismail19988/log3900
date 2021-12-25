package com.zouatene.colorimage.dialog

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.DialogFragment
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentChangeUsernameDialogBinding
import java.lang.ClassCastException

class ChangeUsernameDialogFragment : DialogFragment() {

    interface EditUsernameDialogListener {
        fun onSuccessEditUsernameDialog(newUsername: String)
    }

    private lateinit var editUsernameDialogListener: EditUsernameDialogListener
    private lateinit var binding: FragmentChangeUsernameDialogBinding

    override fun onAttach(context: Context) {
        super.onAttach(context)
        try {
            editUsernameDialogListener =
                parentFragment as EditUsernameDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement EditUsernameDialogListener")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_change_username_dialog,
            container,
            false
        )

        binding.newUsernameInput.doAfterTextChanged {
            binding.confirmButton.isEnabled = !binding.newUsernameInput.text.isNullOrBlank()
        }

        binding.cancelButton.setOnClickListener {
            dismiss()
        }

        binding.confirmButton.setOnClickListener{
            editUsernameDialogListener.onSuccessEditUsernameDialog(binding.newUsernameInput.text.toString())
        }

        return binding.root
    }
}