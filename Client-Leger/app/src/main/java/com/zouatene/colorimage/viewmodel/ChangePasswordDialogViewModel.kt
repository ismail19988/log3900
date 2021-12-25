package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class ChangePasswordDialogViewModel : ViewModel() {

    private val _oldPasswordError = MutableLiveData<String>()
    val oldPasswordError: LiveData<String> = _oldPasswordError

    fun checkOldPasswordValid(enteredPassword: String, oldPassword: String) {
        _oldPasswordError.value = if (enteredPassword != oldPassword) "Mauvais mot de passe" else ""
    }
}