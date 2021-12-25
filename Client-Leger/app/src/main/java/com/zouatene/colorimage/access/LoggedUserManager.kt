package com.zouatene.colorimage.access

import android.content.Context
import android.content.SharedPreferences
import com.zouatene.colorimage.model.User
import com.zouatene.colorimage.model.access.LoggedUser

class LoggedUserManager(context: Context) {
    private val userLocalDatabase: SharedPreferences =
        context.getSharedPreferences("userDetails", 0)
    private var loggedUser = LoggedUser

    fun storeUserData(user: User) {
        val editor = userLocalDatabase.edit()
        editor.putString("username", user.username)
        editor.putString("email", user.email)
        editor.apply()
    }

    fun getLoggedInUser(): LoggedUser {
        val username = userLocalDatabase.getString("username", "")
        val email = userLocalDatabase.getString("email", "")

        loggedUser.username = username ?: ""
        loggedUser.email = email ?: ""
        return loggedUser
    }

    fun clearUserData() {
        val editor: SharedPreferences.Editor = userLocalDatabase.edit()
        editor.clear()
        editor.apply()
    }

    fun setUsername(newUsername: String) {
        val editor = userLocalDatabase.edit()
        editor.putString("username", newUsername)
        editor.apply()
        loggedUser.username = newUsername
    }
}