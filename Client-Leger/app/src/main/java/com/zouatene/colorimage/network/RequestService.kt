package com.zouatene.colorimage.network

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import com.zouatene.colorimage.drawingelement.DrawingElement
import com.zouatene.colorimage.drawingelement.EllipseElement
import com.zouatene.colorimage.drawingelement.PathElement
import com.zouatene.colorimage.drawingelement.RectangleElement
import com.zouatene.colorimage.model.IResponse
import com.zouatene.colorimage.model.IUser
import com.zouatene.colorimage.utils.Constants
import com.zouatene.colorimage.model.access.LoginForm
import com.zouatene.colorimage.model.drawelement.Line
import com.zouatene.colorimage.model.drawelement.Shape
import com.zouatene.colorimage.model.drawelement.VectorObjectJSON
import com.zouatene.colorimage.model.request.*
import com.zouatene.colorimage.model.response.*
import okio.BufferedSource
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

private val moshi = Moshi.Builder()
    .add(KotlinJsonAdapterFactory())
    .build()

private val retrofit = Retrofit.Builder()
    .addConverterFactory(MoshiConverterFactory.create(moshi))
    .baseUrl(Constants.SERVER_URL)
    .build()

interface RequestServiceInterface {
    @POST("user/login")
    fun login(@Body loginForm: LoginForm): Call<LoginResponse>

    @POST("user/logout")
    fun logout(@Body userRequest: UserRequest): Call<IResponse>

    @POST("chat/join_room")
    fun joinRoom(@Body roomRequest: RoomRequest): Call<IResponse>

    @POST("chat/leave_room")
    fun leaveRoom(@Body roomRequest: RoomRequest): Call<IResponse>

    @POST("chat/delete_room")
    fun deleteRoom(@Body roomRequest: RoomRequest): Call<IResponse>

    @POST("chat/room_data")
    fun postRoomData(@Body roomRequest: RoomRequest): Call<ChatRoomResponse>

    @POST("chat/user_joined_rooms")
    fun getJoinedRoomListData(@Body userRequest: UserRequest): Call<RoomListResponse>

    @POST("chat/user_unjoined_rooms")
    fun getUnjoinedRoomListData(@Body userRequest: UserRequest): Call<RoomListResponse>

    @POST("chat/create_room")
    fun createRoom(@Body roomRequest: RoomRequest): Call<IResponse>

    @POST("user/register")
    fun register(@Body registerForm: IUser): Call<IResponse>

    @GET("drawing/get_all_drawings")
    fun getAllDrawings(): Call<DrawingListResponse>

    @POST("drawing/get_drawing_data")
    fun getDrawingData(@Body request: GetDrawingDataRequest): Call<GetDrawingDataResponse>

    @POST("drawing/join_drawing")
    fun joinDrawing(@Body drawingRequest: DrawingRequest): Call<JoinDrawingResponse>

    @POST("drawing/leave_drawing")
    fun leaveDrawing(@Body drawingRequest: DrawingRequest): Call<IResponse>

    @POST("drawing/create")
    fun createDrawing(@Body drawing: CreateDrawingRequest): Call<IResponse>

    @POST("team/get_all_teams")
    fun getJoinedTeamListData(@Body userRequest: UserRequest): Call<TeamListResponse>

    @POST("user/get_user_data")
    fun getUserData(@Body userRequest: UserRequest): Call<GetUserDataResponse>

    @POST("user/update_avatar")
    fun updateAvatar(@Body avatarRequest: AvatarRequest): Call<IResponse>

    @POST("user/update_username")
    fun updateUsername(@Body usernameRequest: UsernameRequest): Call<IResponse>

    @POST("user/update_password")
    fun updatePassword(@Body passwordRequest: PasswordRequest): Call<IResponse>

    @POST("user/update_fullname_privacy")
    fun updateNamePrivacy(@Body namePrivacyRequest: NamePrivacyRequest): Call<IResponse>

    @POST("user/update_email_privacy")
    fun updateEmailPrivacy(@Body emailPrivacyRequest: EmailPrivacyRequest): Call<IResponse>
}

object RequestService {
    val retrofitService: RequestServiceInterface by lazy {
        retrofit.create(RequestServiceInterface::class.java)
    }

    fun convertJson(rawText: BufferedSource?, classToConvert: Class<*>?): Any? {
        val jsonAdapter = moshi.adapter(classToConvert)
        return jsonAdapter.fromJson(rawText)
    }

    fun convertJson(jsonString: String, classToConvert: Class<*>?): Any? {
        val jsonAdapter = moshi.adapter(classToConvert)
        return jsonAdapter.fromJson(jsonString)
    }

    fun <T : Any> convertToJson(t: T): String {
        val jsonAdapter = moshi.adapter(t.javaClass)
        return jsonAdapter.toJson(t)
    }

    fun convertToDrawingElement(element: VectorObjectJSON): DrawingElement? {
        if (element.points != null) {
            val line = Line(
                element.id,
                element.z,
                element.matrix,
                element.strokeWidth,
                element.isSelected,
                element.color,
                element.points
            )
            return PathElement(line)

        }
        if (element.initialPoint != null && element.finalPoint != null) {
            val shape = Shape(
                element.id,
                element.z,
                element.matrix,
                element.isSelected,
                element.initialPoint!!,
                element.color,
                element.finalPoint!!,
                element.strokeColor,
                element.strokeWidth,
                element.text,
                element.textColor
            )
            if (element.type == "ellipse")
                return EllipseElement(shape)
            if (element.type == "rectangle")
                return RectangleElement(shape)
        }
        return null
    }

}
