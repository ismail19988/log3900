package com.zouatene.colorimage.drawingeditor

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.view.*
import android.view.inputmethod.InputMethodManager
import androidx.core.widget.addTextChangedListener
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentSelectionOptionBinding
import com.zouatene.colorimage.drawingelement.DrawingElement
import com.zouatene.colorimage.drawingelement.PathElement
import com.zouatene.colorimage.drawingelement.ShapeElement
import com.zouatene.colorimage.model.drawelement.Line
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.model.drawelement.ElementInfoSocket
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.service.DrawingService
import com.zouatene.colorimage.utils.ColorpickerUtils
import com.zouatene.colorimage.utils.ColorpickerUtils.transformColorToRGB
import com.zouatene.colorimage.utils.MatrixUtils
import com.zouatene.colorimage.viewmodel.DrawingEditorViewModel
import com.zouatene.colorimage.viewmodel.SelectionOptionViewModel
import net.margaritov.preference.colorpicker.ColorPickerPreference

class SelectionOptionFragment(private var element: DrawingElement?) : Fragment() {
    private var binding: FragmentSelectionOptionBinding? = null
    private var user: LoggedUser? = null
    private var selectionViewModel: SelectionOptionViewModel? = null
    private var oldRotationValue: Float = 0f
    private var oldTextValue: String = ""
    private val drawingEditorViewModel: DrawingEditorViewModel by activityViewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_selection_option, container, false)
        val loggedUser = LoggedUserManager(requireContext())
        user = loggedUser.getLoggedInUser()

        selectionViewModel = SelectionOptionViewModel(requireContext())

        setDisplayElement()

        binding!!.deleteButton.setOnClickListener {
            if (element?.id != null) {
                DrawingService.drawingView.emitDeleteEvent(element!!.id)
            }
        }

        activity?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)

        return binding!!.root
    }

    override fun onDestroy() {
        binding = null
        user = null
        selectionViewModel = null
        element = null
        super.onDestroy()
    }

    private fun setDisplayElement() {
        when (element) {
            null -> {
                setNullElementDisplay()
            }

            is PathElement -> {
                val pathElement: PathElement = element as PathElement
                updateDrawingElementDisplay(pathElement)
                setListenersElement(pathElement)
                setPathDisplay()
            }

            is ShapeElement -> {
                val shapeElement: ShapeElement = element as ShapeElement
                setShapeDisplay()
                updateShapeElementDisplay(shapeElement)
                setListenersShape(shapeElement)
            }
        }
    }

    private fun setNullElementDisplay() {
        binding!!.selectedAttributesLayout.visibility = View.GONE
    }

    private fun setPathDisplay() {
        binding!!.selectedAttributesLayout.visibility = View.VISIBLE
        binding!!.shapeAttributesLayout.visibility = View.GONE
    }

    private fun setShapeDisplay() {
        binding!!.selectedAttributesLayout.visibility = View.VISIBLE
        binding!!.shapeAttributesLayout.visibility = View.VISIBLE
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setListenersElement(drawingElement: DrawingElement) {
        binding!!.strokeWidthSlider.addOnChangeListener { _, value, fromUser ->
            if (fromUser) {
                drawingEditorViewModel.isChangingAttribute = true
                drawingElement.strokeWidth = value
                val vectorObject =
                    drawingElement.parseToInterface(MatrixUtils.convertToSVGMatrix(drawingElement.matrix))
                selectionViewModel!!.emitEditEvent(vectorObject, user!!.username, "start_edit")
                DrawingService.drawingView.editElement(vectorObject)
            }
        }
        binding!!.strokeWidthSlider.setOnTouchListener { _, motionEvent ->
            when (motionEvent?.action) {
                MotionEvent.ACTION_DOWN -> {
                    drawingEditorViewModel.isChangingAttribute = true
                }
                MotionEvent.ACTION_UP -> {
                    drawingEditorViewModel.isChangingAttribute = false
                    val vectorObject = drawingElement.parseToInterface(
                        MatrixUtils.convertToSVGMatrix(drawingElement.matrix)
                    )
                    selectionViewModel!!.emitEditEvent(vectorObject, user!!.username, "end_edit")
                }
            }
            false
        }

        binding!!.rotationSlider.addOnChangeListener { _, value, fromUser ->
            if (fromUser) {
                drawingEditorViewModel.isChangingAttribute = true
                //drawingElement.rotation = (value - oldRotationValue).toInt() % 360
                val vectorObject = drawingElement.getRotateMatrix(value - oldRotationValue)
                selectionViewModel!!.emitEditEvent(vectorObject, user!!.username, "start_edit")
                DrawingService.drawingView.editElement(vectorObject)
                oldRotationValue = value
            }
        }
        binding!!.rotationSlider.setOnTouchListener { _, motionEvent ->
            when (motionEvent?.action) {
                MotionEvent.ACTION_DOWN -> {
                    drawingEditorViewModel.isChangingAttribute = true
                }
                MotionEvent.ACTION_UP -> {
                    drawingEditorViewModel.isChangingAttribute = false
                    val vectorObject = drawingElement.parseToInterface(
                        MatrixUtils.convertToSVGMatrix(drawingElement.matrix)
                    )
                    selectionViewModel!!.emitEditEvent(vectorObject, user!!.username, "end_edit")
                }
            }
            false
        }

        binding!!.sendToBackButton.setOnClickListener {

            emitLayerEvent(drawingElement, "send_to_back")
        }

        binding!!.bringToFrontButton.setOnClickListener {
            emitLayerEvent(drawingElement, "bring_to_front")
        }

        binding!!.forwardButton.setOnClickListener {
            emitLayerEvent(drawingElement, "forward")
        }

        binding!!.backwardButton.setOnClickListener {
            emitLayerEvent(drawingElement, "backward")
        }


        binding!!.colorPickerStroke.setOnClickListener {
            val eventFunction = { color: Int ->
                if (drawingElement is PathElement) {
                    val path = drawingElement.parseToInterface(
                        MatrixUtils.convertToSVGMatrix(drawingElement.matrix)
                    ) as Line
                    path.color = ColorPickerPreference.convertToARGB(color)
                    selectionViewModel!!.emitEditEvent(path, user!!.username, "edit")
                    DrawingService.drawingView.editElement(path)

                } else if (drawingElement is ShapeElement) {
                    val shape = drawingElement.parseToInterface(
                        MatrixUtils.convertToSVGMatrix(drawingElement.matrix)
                    ) as Shape
                    shape.color = ColorPickerPreference.convertToARGB(color)
                    selectionViewModel!!.emitEditEvent(shape, user!!.username, "edit")
                    DrawingService.drawingView.editElement(shape)
                }
            }

            ColorpickerUtils.createDialogColor(
                requireContext(),
                drawingElement.strokeColor,
                eventFunction
            )
        }

    }

    private fun setListenersShape(shapeElement: ShapeElement) {
        setListenersElement(shapeElement)
        binding!!.colorPickerBackground.setOnClickListener {
            val eventFunction = { color: Int ->
                val shape =
                    shapeElement.parseToInterface(MatrixUtils.convertToSVGMatrix(shapeElement.matrix)) as Shape
                shape.strokeColor = ColorPickerPreference.convertToARGB(color)
                selectionViewModel!!.emitEditEvent(shape, user!!.username, "edit")
                DrawingService.drawingView.editElement(shape)

            }
            ColorpickerUtils.createDialogColor(requireContext(), shapeElement.color, eventFunction)
        }

        binding!!.colorPickerText.setOnClickListener {
            val eventFunction = { color: Int ->
                val shape =
                    shapeElement.parseToInterface(MatrixUtils.convertToSVGMatrix(shapeElement.matrix)) as Shape
                shape.textColor = ColorPickerPreference.convertToARGB(color)
                selectionViewModel!!.emitEditEvent(shape, user!!.username, "edit")
                DrawingService.drawingView.editElement(shape)

            }
            ColorpickerUtils.createDialogColor(requireContext(), shapeElement.textColor, eventFunction)
        }

        binding!!.shapeTextInput.setOnFocusChangeListener { view, b ->
            drawingEditorViewModel.isChangingAttribute = b
            if(!drawingEditorViewModel.isChangingAttribute && shapeElement.text != oldTextValue) {
                val vectorObject = shapeElement.parseToInterface(
                    MatrixUtils.convertToSVGMatrix(shapeElement.matrix)
                )
                selectionViewModel!!.emitEditEvent(vectorObject, user!!.username, "end_edit")
                println("emitendedit")
                (activity?.getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager).hideSoftInputFromWindow(view.windowToken, 0)
                oldTextValue = shapeElement.text
            }


        }

        binding!!.shapeTextInput.addTextChangedListener {
            val shape =
                shapeElement.parseToInterface(MatrixUtils.convertToSVGMatrix(shapeElement.matrix)) as Shape
            shape.text = it.toString()
            selectionViewModel!!.emitEditEvent(shape, user!!.username, "start_edit")
            DrawingService.drawingView.editElement(shape)
        }
    }

    private fun updateDrawingElementDisplay(drawingElement: DrawingElement) {
        if(drawingElement is ShapeElement )  {
            binding!!.colorPickerStroke.setBackgroundColor(transformColorToRGB(drawingElement.color))
        } else {
            binding!!.colorPickerStroke.setBackgroundColor(transformColorToRGB(drawingElement.strokeColor))
        }

        val strokeWidthSlider = binding!!.strokeWidthSlider
        if (!strokeWidthSlider.isFocused)
            strokeWidthSlider.value = drawingElement.strokeWidth

        val rotationSlider = binding!!.rotationSlider
        if (!rotationSlider.isFocused) {
            //rotationSlider.value = (drawingElement.rotation % 360).toFloat()
            oldRotationValue = rotationSlider.value
        }

    }

    private fun updateShapeElementDisplay(shape: ShapeElement) {
        updateDrawingElementDisplay(shape)
        binding!!.colorPickerBackground.setBackgroundColor(transformColorToRGB(shape.strokeColor))
        binding!!.colorPickerText.setBackgroundColor(transformColorToRGB(shape.textColor))
        binding!!.shapeTextInput.setText(shape.text)
    }

    private fun emitLayerEvent(drawingElement: DrawingElement, layerEvent: String) {
        println("emit $layerEvent")
        val requestSocket = ElementInfoSocket(
            user = user!!.username,
            name = DrawingService.drawingName,
            id = drawingElement.id
        )
        SocketHandler.mSocket.emit(
            layerEvent,
            RequestService.convertToJson(requestSocket)
        )
    }

}