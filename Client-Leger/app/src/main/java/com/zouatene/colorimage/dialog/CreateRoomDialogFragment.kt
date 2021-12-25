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
import com.zouatene.colorimage.databinding.FragmentCreateRoomDialogBinding
import java.lang.ClassCastException

class CreateRoomDialogFragment : DialogFragment() {

    interface CreateRoomDialogListener {
        fun onCreateRoom(roomName: String)
    }

    private lateinit var binding: FragmentCreateRoomDialogBinding
    private lateinit var createRoomDialogListener: CreateRoomDialogListener

    override fun onAttach(context: Context) {
        super.onAttach(context)
        try {
            createRoomDialogListener =
                parentFragment as CreateRoomDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement CreateRoomDialogListener")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_create_room_dialog,
            container,
            false
        )

        binding.roomTitleInput.doAfterTextChanged {
            // TODO("Check if room exists already")
            binding.createRoomButton.isEnabled =
                binding.roomTitleInput.text.toString().isNotBlank()
        }

        binding.createRoomButton.setOnClickListener {
            createRoomDialogListener.onCreateRoom(binding.roomTitleInput.text.toString())
        }

        binding.cancelButton.setOnClickListener {
            dismiss()
        }

        return binding.root
    }
}