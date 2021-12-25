package com.zouatene.colorimage.mainmenu

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.adapter.GalleryAdapter
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.databinding.FragmentGalleryBinding
import com.zouatene.colorimage.dialog.CreateDrawingDialogFragment
import com.zouatene.colorimage.dialog.JoinRoomPasswordDialogFragment
import com.zouatene.colorimage.drawingeditor.DrawingEditorFragment
import com.zouatene.colorimage.model.IDrawing
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.model.Privacy
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.viewmodel.DrawingEditorViewModel
import com.zouatene.colorimage.viewmodel.GalleryViewModel
import com.zouatene.colorimage.viewmodel.RoomListViewModel

class GalleryFragment : Fragment(), JoinRoomPasswordDialogFragment.JoinRoomPasswordDialogListener,
    CreateDrawingDialogFragment.CreateDrawingDialogListener {
    private var binding: FragmentGalleryBinding? = null
    private var adapter: GalleryAdapter? = null
    private var dialog: JoinRoomPasswordDialogFragment? = null
    private var loggedUser: LoggedUser? = null
    private var galleryViewModel: GalleryViewModel? = null
    private var createDrawingDialog: CreateDrawingDialogFragment? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_gallery, container, false)
        println("create view")
        galleryViewModel = GalleryViewModel(requireContext())

        binding!!.progressBarGallery.visibility = View.VISIBLE
        galleryViewModel!!.getAllDrawings()

        loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()

        val onItemClickListener = object : OnItemClickListener {
            override fun onItemClick(position: Int) {
                val drawing = adapter!!.drawingList[position]
                if (drawing.privacy == Privacy.PROTECTED) {
                    showPasswordDialog(drawing.name, drawing.password!!)
                } else {
                    galleryViewModel!!.joinDrawing(
                        loggedUser!!.username,
                        adapter!!.drawingList[position].name
                    )
                }
            }
        }

        adapter = GalleryAdapter(onItemClickListener)
        binding!!.galleryRecyclerView.adapter = adapter

        val roomListViewModel: RoomListViewModel by activityViewModels()

        galleryViewModel!!.drawingList.observe(viewLifecycleOwner, Observer {
            binding!!.progressBarGallery.visibility = View.GONE
            val drawings = it ?: return@Observer as ArrayList<IDrawing>

            binding!!.noDrawingsText.visibility = when (drawings.size) {
                0 -> View.VISIBLE
                else -> View.GONE
            }

            adapter!!.drawingList =
                drawings.filter { drawing -> if (drawing.privacy == Privacy.PRIVATE) drawing.owner == loggedUser!!.username else true } as ArrayList<IDrawing>
        })

        galleryViewModel!!.joinDrawingResult.observe(viewLifecycleOwner, Observer {
            val joinDrawingResult = it ?: return@Observer

            if (joinDrawingResult.success) {
                roomListViewModel.getUserRoomListData(loggedUser!!.username)

                val bundle = Bundle()
                bundle.putString("drawingName", joinDrawingResult.drawingName)
                val fragment =
                    DrawingEditorFragment(joinDrawingResult.listElement, joinDrawingResult.version)
                fragment.arguments = bundle

                parentFragmentManager.beginTransaction().replace(R.id.fragmentContainer, fragment)
                    .addToBackStack(null).commit()
            }
        })

        binding!!.createNewDrawingButton.setOnClickListener {
            createDrawingDialog = CreateDrawingDialogFragment()
            createDrawingDialog!!.show(childFragmentManager, null)
        }

        SocketHandler.mSocket.on("new_drawing") {

            galleryViewModel!!.getAllDrawings()
        }

        val drawingEditorViewModel: DrawingEditorViewModel by activityViewModels()

        drawingEditorViewModel.drawingLeft.observe(viewLifecycleOwner, Observer {
            val drawingLeft = it ?: return@Observer

            if (drawingLeft) {
                roomListViewModel.getUserRoomListData(loggedUser!!.username)
            }
        })

        return binding!!.root
    }

    private fun showPasswordDialog(drawingName: String, password: String) {
        dialog = JoinRoomPasswordDialogFragment()

        val bundle = Bundle()
        bundle.putString("password", password)
        bundle.putString("drawingName", drawingName)

        dialog!!.arguments = bundle
        dialog!!.show(childFragmentManager, null)
    }

    override fun onSuccessJoinRoomPasswordDialog(drawingName: String) {
        galleryViewModel!!.joinDrawing(loggedUser!!.username, drawingName)
        dialog!!.dismiss()
    }


    override fun onDestroy() {
        binding = null
        dialog = null
        galleryViewModel = null
        createDrawingDialog = null
        adapter = null
        loggedUser = null
        SocketHandler.mSocket.off("new_drawing")

        super.onDestroy()
    }

    override fun onSuccessCreateDrawingDialog(drawingName: String) {
        createDrawingDialog?.dismiss()
        val bundle = Bundle()
        bundle.putString("drawingName", drawingName)
        val fragment = DrawingEditorFragment(null, null)
        fragment.arguments = bundle
        galleryViewModel!!.getAllDrawings()
    }
}