package com.zouatene.colorimage.activity

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.databinding.DataBindingUtil
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.ActivityAccessBinding
import com.zouatene.colorimage.utils.InternetAccessUtil

class AccessActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val binding: ActivityAccessBinding =
            DataBindingUtil.setContentView(this, R.layout.activity_access)

        InternetAccessUtil.isOnline(this, binding.internetLostWarning)
    }
}