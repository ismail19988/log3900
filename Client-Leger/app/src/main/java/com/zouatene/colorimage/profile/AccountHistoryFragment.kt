package com.zouatene.colorimage.profile

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.zouatene.colorimage.drawingeditor.DrawingEditorFragment
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.adapter.AccountHistoryAdapter
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.databinding.FragmentAccountHistoryBinding
import com.zouatene.colorimage.model.drawelement.Action
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.utils.ActionType
import com.zouatene.colorimage.viewmodel.GalleryViewModel
import com.zouatene.colorimage.viewmodel.ProfileViewModel

class AccountHistoryFragment : Fragment() {
    private lateinit var binding: FragmentAccountHistoryBinding
    private lateinit var profileViewModel: ProfileViewModel
    private lateinit var loggedUser: LoggedUser
    private lateinit var adapter: AccountHistoryAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_account_history, container, false)

        profileViewModel = ProfileViewModel(requireContext())
        loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()
        val galleryViewModel = GalleryViewModel(requireContext())

        val onItemClickListener = object : OnItemClickListener {
            override fun onItemClick(position: Int) {
                galleryViewModel.joinDrawing(
                    loggedUser.username,
                    adapter.actionList[position].drawing!!
                )
            }
        }

        adapter = AccountHistoryAdapter(requireContext(), onItemClickListener)
        binding.historyRecyclerView.adapter = adapter

        profileViewModel.userDataResult.observe(viewLifecycleOwner, Observer { it ->
            val userDataResult = it ?: return@Observer

            if (userDataResult.success) {
                val data = userDataResult.userData
                val filteredList = data.lastAction.filter { action -> action.action != ActionType.LEAVE_DRAWING.value }
                adapter.actionList = filteredList as ArrayList<Action>
            }
        })

        galleryViewModel.joinDrawingResult.observe(viewLifecycleOwner, Observer {
            val joinRoomResult = it ?: return@Observer

            if (joinRoomResult.success) {
                val bundle = Bundle()
                bundle.putString("drawingName", joinRoomResult.drawingName)
                val fragment = DrawingEditorFragment(joinRoomResult.listElement, joinRoomResult.version)
                fragment.arguments = bundle

                parentFragmentManager.beginTransaction().replace(R.id.fragmentContainer, fragment)
                    .addToBackStack(null).commit()
            }
        })

        binding.backButton.setOnClickListener {
            activity?.onBackPressed()
        }

        profileViewModel.getUserData(loggedUser.username)
        return binding.root
    }
}