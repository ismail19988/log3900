package com.zouatene.colorimage.viewmodel

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.*
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.model.User
import com.zouatene.colorimage.model.access.LoginForm
import com.zouatene.colorimage.model.access.LoginFormState
import com.zouatene.colorimage.model.response.LoginResponse
import com.zouatene.colorimage.model.result.LoginResult
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.utils.HttpCode
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginViewModel(private val context: Context) : ViewModel() {

    private val _loginForm = MutableLiveData<LoginFormState>()
    val loginFormState: LiveData<LoginFormState> = _loginForm

    private val _loginResult = MutableLiveData<LoginResult>()
    val loginResult: LiveData<LoginResult> = _loginResult

    fun login(email: String, password: String) {
        checkEmail(email)
        checkPassword(password)
        if(_loginForm.value?.emailError != null || _loginForm.value?.passwordError != null) {
            // Les messages d'erreurs seront affiches avec checkEmail et checkPassword
            return
        }
        val form = LoginForm(email, password)
        RequestService.retrofitService.login(form)
            .enqueue(object : Callback<LoginResponse> {
                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    _loginResult.value =
                        LoginResult(false, context.getString(R.string.connection_error))
                }

                override fun onResponse(
                    call: Call<LoginResponse>,
                    response: Response<LoginResponse>
                ) {
                    if (response.code() == HttpCode.AUTHORIZED) {
                        println("Connection success!")

                        _loginResult.value =
                            LoginResult(true)

                        val user = User(
                            response.body()!!.username,
                            email
                        )

                        val loggedUser = LoggedUserManager(context)
                        loggedUser.storeUserData(user)

                        SocketHandler.setSocket(user.username)
                        SocketHandler.establishConnection()

                    } else if (response.code() == HttpCode.EMAIL_NOT_FOUND || response.code() == HttpCode.WRONG_PASSWORD ) {
                        _loginResult.value =
                            LoginResult(false, context.getString(R.string.login_account_invalid))
                    } else if(response.code() == HttpCode.USER_ALREADY_CONNECTED) {
                        _loginResult.value =
                            LoginResult(false, context.getString(R.string.user_already_connected_error))
                    } else {
                        _loginResult.value =
                            LoginResult(false, "Erreur ${response.code().toString()}")
                    }
                }
            })
    }

    fun checkEmail(email: String) {
        val emailError = if (!isEmailValid(email)) context.getString(R.string.invalid_email) else null
        _loginForm.value =
            LoginFormState(emailError = emailError, passwordError = _loginForm.value?.passwordError)

    }

    fun checkPassword(password: String) {
        val passwordError =
            if (!isPasswordValid(password)) context.getString(R.string.invalid_password) else null
        _loginForm.value =
            LoginFormState(emailError = _loginForm.value?.emailError, passwordError = passwordError)
    }

    private fun isEmailValid(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun isPasswordValid(password: String): Boolean {
        return password.isNotEmpty()
    }


}