package com.zouatene.colorimage.activity

import android.content.Context
import android.graphics.Rect
import android.os.Bundle
import android.transition.TransitionManager
import android.view.View
import androidx.activity.addCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.transition.doOnEnd
import androidx.databinding.DataBindingUtil
import androidx.interpolator.view.animation.FastOutSlowInInterpolator
import com.google.android.material.transition.platform.MaterialArcMotion
import com.google.android.material.transition.platform.MaterialContainerTransform
import com.zouatene.colorimage.chat.RoomListFragment
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.databinding.ActivityMainBinding
import android.widget.EditText
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.utils.InternetAccessUtil
import com.zouatene.colorimage.utils.OnUnreadMessageListener

class MainActivity : AppCompatActivity(), OnUnreadMessageListener {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = DataBindingUtil.setContentView(this, R.layout.activity_main)

        binding.closeChatButton.setOnClickListener { onBackPressed() }
        binding.openChatContainerFAB.setOnClickListener {
            openChat()
        }
        binding.fabScrim.setOnClickListener { onBackPressed() }

        InternetAccessUtil.isOnline(this, binding.internetLostWarning)
    }

    override fun onDestroy() {
        SocketHandler.closeConnection()
        super.onDestroy()
    }

    override fun dispatchTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_DOWN) {
            val v = currentFocus
            if (v is EditText) {
                val outRect = Rect()
                v.getGlobalVisibleRect(outRect)
                if (!outRect.contains(event.rawX.toInt(), event.rawY.toInt())) {
                    v.clearFocus()
                    val imm: InputMethodManager =
                        getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                    imm.hideSoftInputFromWindow(v.getWindowToken(), 0)
                }
            }
        }
        return super.dispatchTouchEvent(event)
    }

    private fun buildContainerTransformation(): MaterialContainerTransform {
        return MaterialContainerTransform().apply {
            duration = 300
            pathMotion = MaterialArcMotion()
            interpolator = FastOutSlowInInterpolator()
            fadeMode = MaterialContainerTransform.FADE_MODE_IN
        }
    }

    private fun openChat() {
        binding.unreadMessagesCount.visibility = View.GONE
        val transition = buildContainerTransformation()
        transition.startView = binding.openChatContainerFAB
        transition.endView = binding.chatContainerFragmentView

        transition.addTarget(binding.chatContainerFragmentView)
        transition.doOnEnd {
            binding.closeChatButton.visibility = View.VISIBLE
            binding.fabScrim.visibility = View.VISIBLE
        }

        TransitionManager.beginDelayedTransition(findViewById(android.R.id.content), transition)
        binding.chatContainerFragmentView.visibility = View.VISIBLE

        binding.openChatContainerFAB.visibility = View.INVISIBLE
        onBackPressedDispatcher.addCallback(this) {
            // Handle the back button event
            closeChat()
            this.remove()
        }
        val roomListFragment =
            supportFragmentManager.findFragmentByTag("ChatContainerFragment")?.childFragmentManager?.findFragmentByTag(
                "RoomListFragment"
            ) as RoomListFragment

        roomListFragment.onChatOpened()
    }

    private fun closeChat() {
        val closeChatTransition = buildContainerTransformation()
        closeChatTransition.startView = binding.chatContainerFragmentView
        closeChatTransition.endView = binding.openChatContainerFAB

        closeChatTransition.addTarget(binding.openChatContainerFAB)

        TransitionManager.beginDelayedTransition(
            findViewById(android.R.id.content),
            closeChatTransition
        )

        binding.closeChatButton.visibility = View.INVISIBLE
        binding.fabScrim.visibility = View.INVISIBLE
        binding.chatContainerFragmentView.visibility = View.INVISIBLE
        binding.openChatContainerFAB.visibility = View.VISIBLE

        if (Integer.parseInt(binding.unreadMessagesCount.text.toString()) != 0)
            binding.unreadMessagesCount.visibility = View.VISIBLE

        val roomListFragment =
            supportFragmentManager.findFragmentByTag("ChatContainerFragment")?.childFragmentManager?.findFragmentByTag(
                "RoomListFragment"
            ) as RoomListFragment

        roomListFragment.onChatClosed()
    }

    override fun onUnreadMessage(unreadMessagesCount: Int) {
        binding.unreadMessagesCount.text = unreadMessagesCount.toString()
        if (unreadMessagesCount != 0 && binding.chatContainerFragmentView.visibility == View.INVISIBLE)
            binding.unreadMessagesCount.visibility = View.VISIBLE
        else
            binding.unreadMessagesCount.visibility = View.GONE
    }
}


