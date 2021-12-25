package com.zouatene.colorimage.chat

import android.os.Bundle
import android.view.KeyEvent
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.zouatene.colorimage.*
import com.zouatene.colorimage.adapter.MessageAdapter
import com.zouatene.colorimage.databinding.FragmentChatBinding
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.utils.Constants
import com.zouatene.colorimage.viewmodel.ChatViewModel
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.model.access.LoggedUser


class ChatFragment : Fragment() {
    private lateinit var user: LoggedUser
    private lateinit var chatViewModel: ChatViewModel
    private lateinit var adapter: MessageAdapter
    private lateinit var binding: FragmentChatBinding
    private var roomName: String = "General"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_chat, container, false)

        chatViewModel = ChatViewModel()

        val loggedUser = LoggedUserManager(requireContext())
        user = loggedUser.getLoggedInUser()

        adapter = MessageAdapter()
        binding.messagesRecyclerView.adapter = adapter

        val bundle = this.arguments

        if (bundle != null) {
            roomName = bundle.get("roomName") as String
        }

        binding.chatTitle.text = when {
            roomName.startsWith(Constants.ROOM_TEAM_PREFIX) ->
                roomName.drop(Constants.ROOM_TEAM_PREFIX.length)
            roomName.startsWith(Constants.ROOM_DRAWING_PREFIX) ->
                roomName.drop(Constants.ROOM_DRAWING_PREFIX.length)
            else ->
                roomName
        }

        chatViewModel.getRoomData(roomName, user.username)

        SocketHandler.mSocket.on("send_message") {
            val (chatMessage, messageRoom) = chatViewModel.receiveMessage(
                it[0].toString(),
                user.username
            )

            if (roomName == messageRoom) {
                adapter.messageList.add(0, chatMessage)
                activity?.runOnUiThread {
                    adapter.notifyItemInserted(0)
                    binding.messagesRecyclerView.scrollToPosition(0)
                }
            }
        }

        binding.chatTextField.setOnKeyListener(object : View.OnKeyListener {
            override fun onKey(v: View?, keyCode: Int, event: KeyEvent): Boolean {
                if (event.action == KeyEvent.ACTION_DOWN &&
                    keyCode == KeyEvent.KEYCODE_ENTER
                ) {
                    sendMessage()
                    return true
                }
                return false
            }
        })


        binding.sendButton.setOnClickListener {
            sendMessage()
        }

        binding.messagesRecyclerView.addOnLayoutChangeListener { v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom ->
            if (bottom < oldBottom) {
                binding.messagesRecyclerView.postDelayed({
                    binding.messagesRecyclerView.scrollToPosition(0)
                }, 100)
            }
        }

        setChatListeners()
        return binding.root
    }

    private fun setChatListeners() {
        chatViewModel.joinRoomSuccess.observe(viewLifecycleOwner, Observer {
            val joinRoomSuccess = it ?: return@Observer
            if (!joinRoomSuccess) {
                println("Couldn't join room!")
            }
        })

        chatViewModel.messageHistory.observe(viewLifecycleOwner, Observer {
            val messageHistory = it ?: return@Observer
            adapter.messageList = messageHistory
            binding.messagesRecyclerView.scrollToPosition(0)
        })

        chatViewModel.sendMessageSuccess.observe(viewLifecycleOwner, Observer {
            val sendMessageSuccess = it ?: return@Observer
            if (sendMessageSuccess) {
                binding.chatTextField.text?.clear()
            } else {
                println("chat error received")
            }
        })
    }

    private fun sendMessage() {
        val messageChat: String = binding.chatTextField.text.toString()
        chatViewModel.sendMessage(roomName, messageChat, user.username)
    }
}