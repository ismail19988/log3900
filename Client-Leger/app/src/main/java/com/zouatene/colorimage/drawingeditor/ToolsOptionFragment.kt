package com.zouatene.colorimage.drawingeditor

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.activityViewModels
import com.google.android.material.slider.Slider
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentToolsOptionBinding
import com.zouatene.colorimage.service.DrawingService
import com.zouatene.colorimage.utils.ColorpickerUtils
import com.zouatene.colorimage.utils.Constants
import com.zouatene.colorimage.viewmodel.DrawingEditorViewModel
import net.margaritov.preference.colorpicker.ColorPickerPreference

class ToolsOptionFragment : Fragment() {
    private var binding: FragmentToolsOptionBinding? = null
    private var title: String = Constants.TOOL_PENCIL_OPTIONS_TITLE
    private var primaryColorText: String = Constants.TOOL_PENCIL_OPTIONS_PRIMARY_COLOR_TITLE
    private var sliderTitle: String = Constants.TOOL_PENCIL_OPTIONS_SLIDER_TITLE
    private var sliderVisibility: Int = View.VISIBLE
    private var sliderValue: Float = 1f

    private var isStrokeColorVisible: Boolean = true
    private var isFillColorVisible: Boolean = false


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_tools_option, container, false)
        val drawingEditorViewModel: DrawingEditorViewModel by activityViewModels()

        val bundle = this.arguments
        if (bundle != null) {
            title = bundle.get("title") as String
            sliderVisibility = bundle.get("sliderVisibility") as Int
            isStrokeColorVisible = bundle.get("isStrokeColorVisible") as Boolean
            isFillColorVisible = bundle.get("isFillColorVisible") as Boolean
            primaryColorText = bundle.get("primaryColorText") as String

            if (sliderVisibility == View.VISIBLE) {
                sliderTitle = bundle.get("sliderTitle") as String
                sliderValue = bundle.get("sliderValue") as Float
            }

        }

        binding!!.toolNameTitle.text = title
        binding!!.slider.visibility = sliderVisibility
        binding!!.sliderTitle.visibility = sliderVisibility
        binding!!.primaryColorTitle.text = primaryColorText

        if (sliderVisibility == View.VISIBLE) {
            binding!!.sliderTitle.text = sliderTitle
            binding!!.slider.value = sliderValue
            drawingEditorViewModel.changeStrokeWidth(sliderValue)
            binding!!.slider.addOnChangeListener(Slider.OnChangeListener { _, value, _ ->
                drawingEditorViewModel.changeStrokeWidth(value)
            })
        }

        if (isStrokeColorVisible) {
            binding!!.strokeColorLayout.visibility = View.VISIBLE
            binding!!.colorPickerStroke.setBackgroundColor(
                ColorpickerUtils.transformColorToRGB(DrawingService.primaryColor)
            )
            binding!!.colorPickerStroke.setOnClickListener {
                val eventFunction = { color: Int ->
                    DrawingService.primaryColor =
                        ColorPickerPreference.convertToARGB(color)
                    binding!!.colorPickerStroke.setBackgroundColor(
                        ColorpickerUtils.transformColorToRGB(
                            color
                        )
                    )
                }

                ColorpickerUtils.createDialogColor(
                    requireContext(),
                    DrawingService.primaryColor,
                    eventFunction
                )
            }
        }

        if (isFillColorVisible) {
            binding!!.colorBorderLayout.visibility = View.VISIBLE
            binding!!.colorPickerBackground.setBackgroundColor(
                ColorpickerUtils.transformColorToRGB(DrawingService.secondaryColor)
            )
            binding!!.colorPickerBackground.setOnClickListener {
                val eventFunction = { color: Int ->
                    DrawingService.secondaryColor =
                        ColorPickerPreference.convertToARGB(color)
                    binding!!.colorPickerBackground.setBackgroundColor(
                        ColorpickerUtils.transformColorToRGB(
                            color
                        )
                    )
                }

                ColorpickerUtils.createDialogColor(
                    requireContext(),
                    DrawingService.secondaryColor,
                    eventFunction
                )
            }
        }

        return binding!!.root
    }

    override fun onDestroy() {
        binding = null
        super.onDestroy()
    }
}