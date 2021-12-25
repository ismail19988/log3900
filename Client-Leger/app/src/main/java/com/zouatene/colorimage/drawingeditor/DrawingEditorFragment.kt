package com.zouatene.colorimage.drawingeditor

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Toast
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.zouatene.colorimage.activity.AccessActivity
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.adapter.ToolListAdapter
import com.zouatene.colorimage.chat.OnItemClickListener
import com.zouatene.colorimage.databinding.FragmentDrawingEditorBinding
import com.zouatene.colorimage.drawingelement.*
import com.zouatene.colorimage.model.drawelement.Point
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.model.drawelement.VectorObjectJSON
import com.zouatene.colorimage.model.drawelement.*
import com.zouatene.colorimage.model.response.*
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService
import com.zouatene.colorimage.tools.*
import com.zouatene.colorimage.utils.Constants
import com.zouatene.colorimage.utils.Constants.TOOL_SHAPE_OPTIONS_PRIMARY_COLOR_TITLE
import com.zouatene.colorimage.utils.ToolType
import com.zouatene.colorimage.viewmodel.DrawingEditorVersionViewModel
import com.zouatene.colorimage.viewmodel.DrawingEditorViewModel
import kotlin.reflect.KClass

@SuppressLint("ClickableViewAccessibility")
class DrawingEditorFragment(
    private val initialList: MutableList<VectorObjectJSON>?,
    private var drawingVersion: Int?
) : Fragment() {
    private var binding: FragmentDrawingEditorBinding? = null
    private var user: LoggedUser? = null
    private var adapter: ToolListAdapter? = null
    private var drawingBoard: DrawingBoardView? = null
    private val drawingEditorViewModel: DrawingEditorViewModel by activityViewModels()
    private var drawingEditorVersionViewModel: DrawingEditorVersionViewModel? = null
    private lateinit var drawingName: String
    private var currentVersion: Int? = null
    private var loadingDialog: Dialog? = null


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_drawing_editor, container, false)

        val loggedUser = LoggedUserManager(requireContext())
        user = loggedUser.getLoggedInUser()

        val bundle = this.arguments

        if (bundle != null) {
            drawingName = bundle.get("drawingName") as String
        }
        drawingEditorVersionViewModel = DrawingEditorVersionViewModel()

        drawingBoard = binding!!.drawingBoardView
        drawingBoard!!.setListDrawingElements(initialList)

        DrawingService.drawingView = drawingBoard!!
        DrawingService.drawingName = drawingName

        val itemClickListener = object : OnItemClickListener {
            override fun onItemClick(position: Int) {
                if (position == adapter!!.selectedItemIndex) {
                    if (binding!!.toolsFragment.visibility == View.INVISIBLE) {
                        binding!!.toolsFragment.animate()
                            .setDuration(1000)
                            .translationX(0f)
                            .setListener(object : AnimatorListenerAdapter() {
                                override fun onAnimationStart(animation: Animator) {
                                    super.onAnimationStart(animation)
                                    binding!!.toolsFragment.visibility = View.VISIBLE
                                }
                            })
                        binding!!.drawingBoardView.animate()
                            .setDuration(1000)
                            .translationX(0f)
                    } else if (binding!!.toolsFragment.visibility == View.VISIBLE) {
                        binding!!.toolsFragment.animate()
                            .setDuration(1000)
                            .translationX(-binding!!.toolsFragment.width.toFloat())
                            .setListener(object : AnimatorListenerAdapter() {
                                override fun onAnimationEnd(animation: Animator) {
                                    super.onAnimationEnd(animation)
                                    binding!!.toolsFragment.visibility = View.INVISIBLE
                                }
                            })
                        binding!!.drawingBoardView.animate()
                            .setDuration(1000)
                            .translationX(-binding!!.toolsFragment.width.toFloat())
                    }
                } else {
                    changeTool(ToolType.values()[position])
                }
            }
        }

        adapter = ToolListAdapter(requireContext(), itemClickListener)
        binding!!.toolsRecyclerView.adapter = adapter

        createTools()
        listenToDrawingEvents()

        drawingBoard!!.setOnTouchListener(
            adapter!!.toolList[1].getOnTouchListener(user!!.username)
        )

        drawingEditorViewModel.strokeWidthChanged.observe(viewLifecycleOwner, Observer {
            val strokeWidthChanged = it ?: return@Observer
            if (strokeWidthChanged) {
                adapter!!.getCurrentTool().strokeWidth = DrawingService.strokeWidth
            }
        })

        drawingBoard!!.selectedElement.observe(viewLifecycleOwner, {
            val selectedElement = it
            if (adapter!!.getCurrentTool() is SelectionTool) {
                val selectionOptionFragment = SelectionOptionFragment(selectedElement)
                parentFragmentManager.beginTransaction()
                    .replace(R.id.toolsFragment, selectionOptionFragment).commit()
            }
        })

        drawingEditorVersionViewModel!!.drawingData.observe(viewLifecycleOwner, Observer {
            val drawingDataValue = it
            println("newValue DrawingData : ${drawingDataValue?.objects}")
            if (drawingDataValue != null) {
                drawingBoard!!.setListDrawingElements(drawingDataValue.objects)
                Toast.makeText(context, "La version du dessin a été modifiée", Toast.LENGTH_SHORT)
                    .show()
            }
            val localLoading = loadingDialog
            if (localLoading != null && localLoading.isShowing) {
                localLoading.dismiss()
            }
        })

        binding!!.undoButton.setOnClickListener {
            drawingBoard!!.emitUndoEvent(user!!.username)
        }

        binding!!.redoButton.setOnClickListener {
            drawingBoard!!.emitRedoEvent(user!!.username)
        }

        binding!!.backToGalleryButton.setOnClickListener {
            activity?.onBackPressed()
        }

        binding!!.disconnectButton.setOnClickListener {
            loggedUser.clearUserData()
            val intent = Intent(requireView().context, AccessActivity::class.java)
            intent.flags =
                Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        return binding!!.root
    }

    override fun onDestroyView() {
        DrawingService.reset()
        val preview = drawingBoard!!.getViewByteArray()
        drawingEditorViewModel.leaveDrawing(user!!.username, drawingName, preview)

        unsubscribeSocketListener()
        super.onDestroyView()
    }

    override fun onDestroy() {
        binding = null
        user = null
        adapter = null
        drawingBoard = null
        drawingEditorVersionViewModel = null
        loadingDialog = null
        super.onDestroy()
    }

    private fun unsubscribeSocketListener() {
        SocketHandler.mSocket.off("create_line")
        SocketHandler.mSocket.off("create_rectangle")
        SocketHandler.mSocket.off("create_ellipse")
        SocketHandler.mSocket.off("draw_line")
        SocketHandler.mSocket.off("draw_rectangle")
        SocketHandler.mSocket.off("draw_ellipse")
        SocketHandler.mSocket.off("select")
        SocketHandler.mSocket.off("unselect")
        SocketHandler.mSocket.off("delete")
        SocketHandler.mSocket.off("edit_line")
        SocketHandler.mSocket.off("edit_rectangle")
        SocketHandler.mSocket.off("edit_ellipse")
        SocketHandler.mSocket.off("edit_z")
        SocketHandler.mSocket.off("changed_version")
    }

    private fun createTools() {
        val toolList = ArrayList<Tool>()
        toolList.add(SelectionTool(ToolType.SELECTION, R.drawable.cursor))
        toolList.add(PencilTool(ToolType.PENCIL, R.drawable.edit))
        toolList.add(RectangleTool(ToolType.RECTANGLE, R.drawable.rectangle))
        toolList.add(EllipseTool(ToolType.ELLIPSE, R.drawable.circle))

        adapter!!.toolList = toolList
    }

    private fun listenToDrawingEvents() {
        SocketHandler.mSocket.on("create_line") {
            val response: CreateLineResponseSocket = RequestService.convertJson(
                it[0].toString(),
                CreateLineResponseSocket::class.java
            ) as CreateLineResponseSocket
            createDrawingElement(response.user, PathElement(response.line))
        }

        SocketHandler.mSocket.on("create_rectangle") {
            val response: CreateShapeResponseSocket = RequestService.convertJson(
                it[0].toString(),
                CreateShapeResponseSocket::class.java
            ) as CreateShapeResponseSocket
            createDrawingElement(response.user, RectangleElement(response.shape))
        }

        SocketHandler.mSocket.on("create_ellipse") {
            val response: CreateShapeResponseSocket = RequestService.convertJson(
                it[0].toString(),
                CreateShapeResponseSocket::class.java
            ) as CreateShapeResponseSocket
            createDrawingElement(response.user, EllipseElement(response.shape))
        }

        SocketHandler.mSocket.on("draw_line") {
            val response: DrawLineResponseSocket = RequestService.convertJson(
                it[0].toString(),
                DrawLineResponseSocket::class.java
            ) as DrawLineResponseSocket
            drawElement(response.id, response.point, PathElement::class)
        }

        SocketHandler.mSocket.on("draw_rectangle") {
            val response: DrawShapeResponseSocket = RequestService.convertJson(
                it[0].toString(),
                DrawShapeResponseSocket::class.java
            ) as DrawShapeResponseSocket
            drawElement(response.id, response.point, RectangleElement::class)
        }

        SocketHandler.mSocket.on("draw_ellipse") {
            val response: DrawShapeResponseSocket = RequestService.convertJson(
                it[0].toString(),
                DrawShapeResponseSocket::class.java
            ) as DrawShapeResponseSocket
            drawElement(response.id, response.point, EllipseElement::class)
        }

        SocketHandler.mSocket.on("select") {
            val response: ElementInfoSocket = RequestService.convertJson(
                it[0].toString(),
                ElementInfoSocket::class.java
            ) as ElementInfoSocket
            activity?.runOnUiThread {
                drawingBoard!!.selectElement(
                    user!!.username,
                    response.id,
                    response.user
                )
            }
        }

        SocketHandler.mSocket.on("unselect") {
            val response: ElementInfoSocket = RequestService.convertJson(
                it[0].toString(),
                ElementInfoSocket::class.java
            ) as ElementInfoSocket
            activity?.runOnUiThread {
                drawingBoard!!.unselectElement(
                    user!!.username,
                    response.id,
                    response.user
                )
            }
        }

        SocketHandler.mSocket.on("delete") {
            val response: ElementInfoSocket = RequestService.convertJson(
                it[0].toString(),
                ElementInfoSocket::class.java
            ) as ElementInfoSocket
            activity?.runOnUiThread {
                drawingBoard!!.deleteElement(response.id)
            }
        }

        SocketHandler.mSocket.on("edit_line") {

            val response: EditLineResponseSocket = RequestService.convertJson(
                it[0].toString(),
                EditLineResponseSocket::class.java
            ) as EditLineResponseSocket
            if (response.id != drawingBoard!!.selectedElement.value?.id) {
                drawingBoard!!.editElement(response.line)
            }

            if (response.user == user!!.username && !drawingEditorViewModel.isChangingAttribute) {
                activity?.runOnUiThread { drawingBoard!!.forceRefreshSelectedElement() }
            }
        }

        SocketHandler.mSocket.on("edit_rectangle") {
            editShape(it)
        }
        SocketHandler.mSocket.on("edit_ellipse") {
            editShape(it)
        }

        SocketHandler.mSocket.on("edit_z") {
            val response: EditZResponseSocket = RequestService.convertJson(
                it[0].toString(),
                EditZResponseSocket::class.java
            ) as EditZResponseSocket
            drawingBoard!!.editZ(response.objects)
        }

        SocketHandler.mSocket.on("changed_version") {
            activity?.runOnUiThread {

                loadingDialog = Dialog(requireContext())
                var localDialog = loadingDialog

                if (localDialog != null) {
                    localDialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
                    localDialog.setContentView(R.layout.progress_bar_layout)
                    localDialog.setCancelable(true)
                    localDialog.setCanceledOnTouchOutside(true)
                    localDialog.show()
                }
                drawingBoard!!.reset()
            }
            DrawingService.resetState()
            drawingEditorVersionViewModel!!.getDrawingData(drawingName)
            println(drawingName)
            println("changedVersion")
        }

    }

    private fun editShape(it: Array<Any>) {
        val response: EditShapeResponseSocket = RequestService.convertJson(
            it[0].toString(),
            EditShapeResponseSocket::class.java
        ) as EditShapeResponseSocket

        if (response.id != drawingBoard!!.selectedElement.value?.id) {
            drawingBoard!!.editElement(response.shape)
        }
        if (response.user == user!!.username && !drawingEditorViewModel.isChangingAttribute) {
            activity?.runOnUiThread { drawingBoard!!.forceRefreshSelectedElement() }
        }
    }

    private fun changeTool(tool: ToolType) {
        if (tool != adapter!!.toolList[adapter!!.selectedItemIndex].type) {
            val bundle = Bundle()
            var title = ""
            var sliderVisibility = 0
            var sliderTitle = ""
            var isStrokeColorVisible = false
            var isFillColorVisible = false
            var primaryColorTitle = ""
            var secondaryColorTitle = ""
            when (tool) {
                ToolType.PENCIL -> {
                    title = Constants.TOOL_PENCIL_OPTIONS_TITLE
                    sliderVisibility = View.VISIBLE
                    sliderTitle = Constants.TOOL_PENCIL_OPTIONS_SLIDER_TITLE
                    isStrokeColorVisible = true
                    isFillColorVisible = false
                    primaryColorTitle = Constants.TOOL_PENCIL_OPTIONS_PRIMARY_COLOR_TITLE
                    secondaryColorTitle = ""
                }
                ToolType.RECTANGLE -> {
                    title = Constants.TOOL_RECTANGLE_OPTIONS_TITLE
                    sliderVisibility = View.VISIBLE
                    sliderTitle = Constants.TOOL_PENCIL_OPTIONS_SLIDER_TITLE
                    isStrokeColorVisible = true
                    isFillColorVisible = true
                    primaryColorTitle = Constants.TOOL_PENCIL_OPTIONS_PRIMARY_COLOR_TITLE
                    secondaryColorTitle = TOOL_SHAPE_OPTIONS_PRIMARY_COLOR_TITLE

                }
                ToolType.ELLIPSE -> {
                    title = Constants.TOOL_ELLIPSE_OPTIONS_TITLE
                    sliderVisibility = View.VISIBLE
                    sliderTitle = Constants.TOOL_PENCIL_OPTIONS_SLIDER_TITLE
                    isStrokeColorVisible = true
                    isFillColorVisible = true
                    primaryColorTitle = Constants.TOOL_PENCIL_OPTIONS_PRIMARY_COLOR_TITLE
                    secondaryColorTitle = TOOL_SHAPE_OPTIONS_PRIMARY_COLOR_TITLE
                }
            }

            if (tool == ToolType.SELECTION) {
                val selectionOptionFragment =
                    SelectionOptionFragment(drawingBoard!!.selectedElement.value)
                parentFragmentManager.beginTransaction()
                    .replace(R.id.toolsFragment, selectionOptionFragment).commit()

            } else {
                bundle.putString("title", title)
                bundle.putInt("sliderVisibility", sliderVisibility)
                bundle.putString("sliderTitle", sliderTitle)
                bundle.putFloat("sliderValue", adapter!!.toolList[tool.value].strokeWidth)
                bundle.putBoolean("isStrokeColorVisible", isStrokeColorVisible)
                bundle.putBoolean("isFillColorVisible", isFillColorVisible)
                bundle.putString("primaryColorText", primaryColorTitle)
                bundle.putString("secondaryColorTitle", secondaryColorTitle)


                val toolsOptionFragment = ToolsOptionFragment()
                toolsOptionFragment.arguments = bundle

                parentFragmentManager.beginTransaction()
                    .replace(R.id.toolsFragment, toolsOptionFragment).commit()

                drawingBoard!!.emitUnselectEvent()
            }

            drawingBoard!!.setOnTouchListener(
                adapter!!.toolList[tool.value].getOnTouchListener(user!!.username)
            )
            adapter!!.selectedItemIndex = tool.ordinal
            activity?.runOnUiThread {
                adapter!!.notifyDataSetChanged()
            }
        }
    }

    private fun createDrawingElement(username: String, drawingElement: DrawingElement) {
        if (username == user!!.username && DrawingService.isDrawing) {
            DrawingService.currentId = drawingElement.id
        }
        drawingBoard!!.addNewElement(drawingElement)
    }

    private fun drawElement(id: String, point: Point, elementType: KClass<out DrawingElement>) {
        drawingBoard!!.changePathTo(id, point, elementType)
    }
}