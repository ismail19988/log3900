package com.zouatene.colorimage.tools

import android.view.View
import com.zouatene.colorimage.utils.ToolType

abstract class Tool(val type: ToolType, val icon: Int) {
    var strokeWidth: Float = 3f
    abstract fun getOnTouchListener(username: String): View.OnTouchListener

}