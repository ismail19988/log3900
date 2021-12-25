package com.zouatene.colorimage.dialog

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.RecyclerView
import com.zouatene.colorimage.R
import com.zouatene.colorimage.adapter.AvatarAdapter
import com.zouatene.colorimage.databinding.DefaultAvatarCollectionsBinding
import com.zouatene.colorimage.model.access.DefaultAvatar
import com.zouatene.colorimage.viewmodel.AvatarCollectionsDialogViewModel
import java.lang.ClassCastException

class AvatarCollectionsDialogFragment : DialogFragment() {

    private lateinit var avatarRecyclerView: RecyclerView
    private lateinit var avatarAdapter: AvatarAdapter
    private lateinit var editAvatarDialogListener: EditAvatarDialogListener

    override fun onAttach(context: Context) {
        super.onAttach(context)

        try {
            editAvatarDialogListener = parentFragment as EditAvatarDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement EditAvatarDialogListener")
        }
    }

    interface EditAvatarDialogListener {
        fun onFinishEditAvatarDialog(url: String)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        val binding: DefaultAvatarCollectionsBinding =
            DataBindingUtil.inflate(inflater, R.layout.default_avatar_collections, container, false)

        avatarRecyclerView = binding.avatarsRecyclerView

        avatarAdapter = AvatarAdapter()

        avatarRecyclerView.adapter = avatarAdapter

        val avatarCollectionsDialogViewModel: AvatarCollectionsDialogViewModel by activityViewModels()

        val avatarUrls = ArrayList<DefaultAvatar>()
        avatarCollectionsDialogViewModel.avatarUrlMap.values.forEach { url -> avatarUrls.add(
            DefaultAvatar(url)
        ) }
        
        avatarAdapter.avatarList = avatarUrls

        binding.avatarSelectionButton.setOnClickListener {
            if (avatarAdapter.selectedItemIndex != -1) {
                val selectedAvatar = avatarAdapter.avatarList[avatarAdapter.selectedItemIndex]
                editAvatarDialogListener.onFinishEditAvatarDialog(
                    selectedAvatar.avatar
                )
                dismiss()
            } else {
                Toast.makeText(
                    requireContext(),
                    "Aucun avatar n'a été selectionné",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

        return binding.root

    }
}