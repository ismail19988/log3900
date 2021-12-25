package com.zouatene.colorimage.utils

import android.graphics.Rect
import android.graphics.RectF
import androidx.core.graphics.toRect
import com.zouatene.colorimage.utils.Constants.BORDER_HALF_LENGTH_RECTANGLE
import com.zouatene.colorimage.utils.Constants.TOUCH_RADIUS
import kotlin.math.roundToInt

enum class HandleLocation{
    LEFT, TOP, RIGHT, BOTTOM
}
class SelectionHandleElement( var centerX: Float,  var centerY: Float, var location: HandleLocation) {

    fun pointOnHandle(x: Float, y: Float): Boolean {
        val rectBounds = RectF(
            centerX - BORDER_HALF_LENGTH_RECTANGLE,
            centerY - BORDER_HALF_LENGTH_RECTANGLE,
            centerX + BORDER_HALF_LENGTH_RECTANGLE,
            centerY + BORDER_HALF_LENGTH_RECTANGLE
        )

        // Create Rectangle from point
        val touchRect = Rect(
            x.roundToInt() - TOUCH_RADIUS,
            y.roundToInt() - TOUCH_RADIUS,
            x.roundToInt() + TOUCH_RADIUS,
            y.roundToInt() + TOUCH_RADIUS
        )
        return touchRect.intersect(rectBounds.toRect())
    }

}