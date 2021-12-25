package com.zouatene.colorimage.utils

import android.graphics.Color


object Constants {
//     const val SERVER_URL = "http://10.0.2.2:3000"
    const val SERVER_URL = "https://log3900-102.herokuapp.com/"
    const val GENERAL_ROOM = "General"

    const val TOOL_SELECTION_OPTIONS_TITLE = "Outil de sélection"
    const val TOOL_PENCIL_OPTIONS_TITLE = "Outil de traçage"
    const val TOOL_RECTANGLE_OPTIONS_TITLE = "Outil de rectangle"
    const val TOOL_ELLIPSE_OPTIONS_TITLE = "Outil d'ellipse"

    const val TOOL_PENCIL_OPTIONS_SLIDER_TITLE = "Épaisseur du trait"
    const val TOOL_SHAPE_OPTIONS_SLIDER_TITLE = "Épaisseur du contour"

    const val TOOL_PENCIL_OPTIONS_PRIMARY_COLOR_TITLE = "Couleur"
    const val TOOL_SHAPE_OPTIONS_PRIMARY_COLOR_TITLE = "Couleur du contour"

    // CHAT TITLE PREFIX
    const val ROOM_DRAWING_PREFIX = "ROOM_DRAWING_"
    const val ROOM_TEAM_PREFIX = "ROOM_TEAM_"

    // Selection Parameters
    const val TOUCH_RADIUS = 8
    const val STROKE_WIDTH_SELECTION = 4f
    const val BORDER_HALF_LENGTH_RECTANGLE = 10f

    const val PERMISSION_REQUEST_CODE = 200

    val statusMap = mapOf("connected" to Color.GREEN, "disconnected" to Color.GRAY,  "busy" to Color.RED).withDefault { Color.GRAY }
    const val AUTHOR_TEAM_AVATAR =
        "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/unknown.png?alt=media&token=f329761c-a980-4156-a7e7-62d266ee89d1"
}