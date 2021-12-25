package com.zouatene.colorimage.viewmodel

import android.content.Context
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.model.request.*
import com.zouatene.colorimage.model.response.GetUserDataResponse
import com.zouatene.colorimage.model.result.UserDataResult
import com.zouatene.colorimage.network.RequestService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileViewModel(private val context: Context) : ViewModel() {
    private val _userDataResult = MutableLiveData<UserDataResult>()
    val userDataResult: LiveData<UserDataResult> = _userDataResult


    fun getUserData(username: String) {
        val userRoomRequest = UserRequest(username)
        println(userRoomRequest)
        RequestService.retrofitService.getUserData(userRoomRequest)
            .enqueue(object : Callback<GetUserDataResponse> {
                override fun onResponse(
                    call: Call<GetUserDataResponse>,
                    response: Response<GetUserDataResponse>
                ) {
                    if (response.code() == 200) {
                        _userDataResult.value = UserDataResult(true, response.body()!!.user)
                    } else {
                        // TODO("Not yet implemented")
                        println("Couldn't get user's data")
                    }
                    println(response.body())
                }

                override fun onFailure(call: Call<GetUserDataResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to get user's data")
                    println(t.message)
                }
            })
    }

    fun updateAvatar(username: String, avatar: Any) {
        val avatarRequest = AvatarRequest(username, avatar)
        RequestService.retrofitService.updateAvatar(avatarRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        Toast.makeText(context, "Avatar modifié!", Toast.LENGTH_SHORT)
                            .show()
                        getUserData(username)
                    } else {
                        Toast.makeText(context, "Avatar n'a pas pu être modifié!", Toast.LENGTH_SHORT)
                            .show()
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    Toast.makeText(context, "Avatar n'a pas pu être modifié!", Toast.LENGTH_SHORT)
                        .show()
                    println("Couldn't update avatar")
                    println(t.message)
                }
            })
    }

    fun updateUsername(username: String, newUsername: String) {
        val usernameRequest = UsernameRequest(username, newUsername)
        RequestService.retrofitService.updateUsername(usernameRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        getUserData(newUsername)
                        LoggedUserManager(context).setUsername(newUsername)
                        Toast.makeText(context, "Pseudonyme changé!", Toast.LENGTH_SHORT)
                            .show()
                    } else {
                        Toast.makeText(context, "Pseudonyme n'a pu être changé!", Toast.LENGTH_SHORT)
                            .show()
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    Toast.makeText(context, "Pseudonyme n'a pu être changé!", Toast.LENGTH_SHORT)
                        .show()
                    println("Couldn't update username")
                    println(t.message)
                }
            })
    }

    fun updatePassword(username: String, password: String) {
        val passwordRequest = PasswordRequest(username, password)
        RequestService.retrofitService.updatePassword(passwordRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() == 200) {
                        getUserData(username)
                        Toast.makeText(context, "Mot de passe changé!", Toast.LENGTH_SHORT)
                            .show()
                    } else {
                        Toast.makeText(context, "Mot de passe n'a pu être changé!", Toast.LENGTH_SHORT)
                            .show()
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    Toast.makeText(context, "Mot de passe n'a pu être changé!", Toast.LENGTH_SHORT)
                        .show()
                    println("Couldn't update password")
                    println(t.message)
                }
            })
    }

    fun updateEmailPrivacy(username: String, isEmailPublic: Boolean) {
        val emailPrivacyRequest = EmailPrivacyRequest(username, isEmailPublic)
        RequestService.retrofitService.updateEmailPrivacy(emailPrivacyRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() != 200) {
                        Toast.makeText(context, "La confidentialité du courriel n'a pas pu être modifié!", Toast.LENGTH_SHORT)
                            .show()
                        val bodyError =
                            RequestService.convertJson(
                                response.errorBody()?.source(),
                                IResponse::class.java
                            ) as IResponse
                        println(bodyError.message)
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    Toast.makeText(context, "Couldn't update email privacy!", Toast.LENGTH_SHORT)
                        .show()
                    println("La confidentialité du courriel n'a pas pu être modifié!")
                    println(t.message)
                }
            })
    }

    fun updateNamePrivacy(username: String, isNamePublic: Boolean) {
        val namePrivacyRequest = NamePrivacyRequest(username, isNamePublic)
        RequestService.retrofitService.updateNamePrivacy(namePrivacyRequest)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    if (response.code() != 200) {
                        Toast.makeText(context, "La confidentialité du nom n'a pas pu être modifié!", Toast.LENGTH_SHORT)
                            .show()
                    }
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    Toast.makeText(context, "La confidentialité du nom n'a pas pu être modifié!", Toast.LENGTH_SHORT)
                        .show()
                    println("Couldn't update name privacy")
                    println(t.message)
                }
            })
    }
}