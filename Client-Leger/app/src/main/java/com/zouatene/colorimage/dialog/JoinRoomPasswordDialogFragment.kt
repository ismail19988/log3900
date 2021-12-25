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
import com.zouatene.colorimage.databinding.FragmentJoinRoomPasswordDialogBinding
import java.lang.ClassCastException

class JoinRoomPasswordDialogFragment : DialogFragment() {

    interface JoinRoomPasswordDialogListener {
        fun onSuccessJoinRoomPasswordDialog(drawingName: String)
    }

    private lateinit var joinRoomPasswordDialogListener: JoinRoomPasswordDialogListener
    private lateinit var drawingName: String
    private lateinit var expectedPasword : String

    override fun onAttach(context: Context) {
        super.onAttach(context)
        try {
            joinRoomPasswordDialogListener = parentFragment as JoinRoomPasswordDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement JoinRoomPasswordDialogListener")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val binding: FragmentJoinRoomPasswordDialogBinding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_join_room_password_dialog,
            container,
            false
        )

        val bundle = this.arguments
        if (bundle != null) {
            expectedPasword = bundle.get("password") as String
            drawingName = bundle.get("drawingName") as String
        }

        binding.cancelButton.setOnClickListener {
            dismiss()
        }

        binding.joinDrawingButton.setOnClickListener {
            if (binding.passwordFieldDrawing.text.toString() == expectedPasword) {
                joinRoomPasswordDialogListener.onSuccessJoinRoomPasswordDialog(drawingName)
            } else {
                binding.wrongPasswordText.visibility = View.VISIBLE
            }
        }

        binding.passwordFieldDrawing.doAfterTextChanged {
            binding.joinDrawingButton.isEnabled = binding.passwordFieldDrawing.text!!.isNotBlank()
            binding.wrongPasswordText.visibility = View.INVISIBLE
        }

        return binding.root
    }
}