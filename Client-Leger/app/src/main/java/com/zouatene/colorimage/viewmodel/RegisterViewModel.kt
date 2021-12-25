package com.zouatene.colorimage.viewmodel

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.zouatene.colorimage.R
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.model.result.RegisterResult
import com.zouatene.colorimage.network.RequestService
import com.zouatene.colorimage.utils.HttpCode
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterViewModel(private val context: Context) : ViewModel() {

    private val _firstNameError = MutableLiveData<String>()
    val firstNameError: LiveData<String> = _firstNameError

    private val _lastNameError = MutableLiveData<String>()
    val lastNameError: LiveData<String> = _lastNameError

    private val _emailError = MutableLiveData<String>()
    val emailError: LiveData<String> = _emailError

    private val _usernameError = MutableLiveData<String>()
    val usernameError: LiveData<String> = _usernameError

    private val _passwordErrors = MutableLiveData<MutableList<String>>()
    val passwordErrors: LiveData<MutableList<String>> = _passwordErrors

    private val _confirmPasswordError = MutableLiveData<String>()
    val confirmPasswordError: LiveData<String> = _confirmPasswordError

    private val _registerResult = MutableLiveData<RegisterResult>()
    val registerResult: LiveData<RegisterResult> = _registerResult

    lateinit var avatar: Any

    fun checkEmailValid(email: String) {
        _emailError.value = if (email.isBlank() || !Patterns.EMAIL_ADDRESS.matcher(email)
                .matches()
        ) context.getString(
            R.string.invalid_email
        ) else ""
    }

    fun checkFirstNameValid(firstName: String) {
        _firstNameError.value =
            if (firstName.isNullOrBlank()) context.getString(R.string.first_name_empty) else ""
    }

    fun checkLastNameValid(lastName: String) {
        _lastNameError.value =
            if (lastName.isNullOrBlank()) context.getString(R.string.last_name_empty) else ""
    }

    fun checkUsernameValid(username: String) {
        _usernameError.value =
            if (username.isNullOrBlank()) context.getString(R.string.username_empty) else ""
    }

    fun checkPasswordValid(password: String) {
        val errorList: MutableList<String> = mutableListOf()
        if (!password.matches(Regex(".*[0-9].*"))) errorList.add(context.getString(R.string.no_digit_password))

        if (!password.matches(Regex(".*[a-z].*"))) errorList.add(context.getString(R.string.no_lowercase_password))

        if (!password.matches(Regex(".*[A-Z].*"))) errorList.add(context.getString(R.string.no_uppercase_password))

        if (password.length < 8) errorList.add(context.getString(R.string.too_small_password))

        _passwordErrors.value = errorList
    }

    fun checkConfirmPasswordValid(password: String, confirmPassword: String) {
        _confirmPasswordError.value =
            if (password != confirmPassword) context.getString(R.string.confirm_password_no_match) else ""
    }

    fun signup(user: IUser, confirmPassword: String) {
        if (!isAllInfoValid(user, confirmPassword)) {
            // Les checks vont afficher les erreurs
            return
        }
        RequestService.retrofitService.register(user)
            .enqueue(object : Callback<IResponse> {
                override fun onResponse(
                    call: Call<IResponse>,
                    response: Response<IResponse>
                ) {
                    when {
                        response.code() == HttpCode.AUTHORIZED -> {
                            _registerResult.value = RegisterResult(success = true)
                        }
                        response.code() == HttpCode.EMAIL_ALREADY_EXISTS -> {
                            _emailError.value = context.getString(R.string.email_already_exists)
                            _registerResult.value = RegisterResult(false, "")
                        }
                        response.code() == HttpCode.USERNAME_ALREADY_EXISTS -> {
                            _usernameError.value =
                                context.getString(R.string.username_already_exists)
                            _registerResult.value = RegisterResult(false, "")
                        }
                        response.code() == HttpCode.DATABASE_ERROR -> {
                            _registerResult.value =
                                RegisterResult(false, context.getString(R.string.database_error))
                        }
                        else -> {
                            _registerResult.value =
                                RegisterResult(false, context.getString(R.string.unknown_error))
                        }
                    }
                    println(response.code())
                }

                override fun onFailure(call: Call<IResponse>, t: Throwable) {
                    _registerResult.value =
                        RegisterResult(false, context.getString(R.string.connection_error))
                }
            })
    }

    fun isAllInfoValid(user: IUser, confirmPassword: String): Boolean {
        checkFirstNameValid(user.firstname)
        checkLastNameValid(user.lastname)
        checkEmailValid(user.email)
        checkUsernameValid(user.username)
        checkPasswordValid(user.password)
        checkConfirmPasswordValid(user.password, confirmPassword)

        return (_lastNameError.value.isNullOrBlank()
                && _firstNameError.value.isNullOrBlank()
                && _emailError.value.isNullOrBlank()
                && _usernameError.value.isNullOrBlank()
                && _passwordErrors.value.isNullOrEmpty()
                && _confirmPasswordError.value.isNullOrBlank())
    }
}