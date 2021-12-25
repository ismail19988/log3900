package com.zouatene.colorimage.utils

import android.content.Context
import android.graphics.Color
import net.margaritov.preference.colorpicker.ColorPickerDialog
import net.margaritov.preference.colorpicker.ColorPickerPreference

object ColorpickerUtils {

    fun createDialogColor(context: Context, initialColor: String, eventFunc: (Int) -> Unit ) {
        val colorPickerDialog = ColorPickerDialog(
            context,
            ColorPickerPreference.convertToColorInt(initialColor)
        )
        colorPickerDialog.hexValueEnabled = true
        colorPickerDialog.setOnCancelListener {
            eventFunc(colorPickerDialog.color)
        }
        colorPickerDialog.setOnColorChangedListener {
            eventFunc(it)
        }
        colorPickerDialog.alphaSliderVisible = true
        colorPickerDialog.show()
    }

    fun transformColorToRGB(color: String): Int {
        return Color.parseColor(ColorPickerPreference.convertToRGB(Color.parseColor(color)))
    }

    fun transformColorToRGB(color: Int): Int {
        return Color.parseColor(ColorPickerPreference.convertToRGB(color))
    }
}