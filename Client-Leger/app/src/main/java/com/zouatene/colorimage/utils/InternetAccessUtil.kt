package com.zouatene.colorimage.utils

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.app.Activity
import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.view.View
import androidx.constraintlayout.widget.ConstraintLayout

object InternetAccessUtil {
    fun isOnline(activity: Activity, warning: ConstraintLayout) {
        val connectivityManager =
            activity.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        connectivityManager.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                //take action when network connection is gained
                warning.animate()
                    .translationY(-50f)
                    .alpha(0.0f)
                    .setDuration(300)
                    .setListener(object : AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: Animator) {
                            super.onAnimationEnd(animation)
                            warning.visibility = View.GONE
                        }
                    })
            }

            override fun onLost(network: Network) {
                //take action when network connection is lost
                warning.animate()
                    .translationY(0f)
                    .alpha(1f)
                    .setDuration(300)
                    .setListener(object : AnimatorListenerAdapter() {
                        override fun onAnimationStart(animation: Animator) {
                            super.onAnimationStart(animation)
                            warning.visibility = View.VISIBLE
                        }
                    })
            }
        })
    }
}