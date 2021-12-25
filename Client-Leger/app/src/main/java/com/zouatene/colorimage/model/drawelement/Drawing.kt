package com.zouatene.colorimage.model

import com.squareup.moshi.Json
import com.zouatene.colorimage.model.drawelement.VectorObjectJSON

enum class Privacy(val value: Int) {
    @Json(name = "public")
    PUBLIC(0),

    @Json(name = "protected")
    PROTECTED(1),

    @Json(name = "private")
    PRIVATE(2),
}

class IDrawing(
    val creationTimestamp: Double?,
    val name: String,
    val objects: MutableList<VectorObjectJSON>?,
    val owner: String,
    val password: String? = null,
    val preview: String,
    val privacy: Privacy,
    val avatar: String?,
    val nbCollaborateurs: Int?,
    val version: Int?,
    val versions: Int?,
    val team: String?
)

class DataDrawing(
    val creationTimestamp: Double?,
    val name: String?,
    val objects: MutableList<VectorObjectJSON>?,
    val owner: String?,
    val password: String? = null,
    val preview: String?,
    val privacy: Int?,
    val avatar: String?,
    val nbCollaborateurs: Int?,
    val version: Int?,
    val versions: Int?
)