package com.zouatene.colorimage.chat

import android.content.Context
import android.media.MediaPlayer
import android.os.Bundle
import android.view.*
import androidx.fragment.app.Fragment
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.zouatene.colorimage.viewmodel.RoomListViewModel
import com.zouatene.colorimage.databinding.FragmentRoomListBinding
import androidx.appcompat.widget.SearchView
import androidx.fragment.app.activityViewModels
import com.zouatene.colorimage.model.chat.Room
import com.zouatene.colorimage.*
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.adapter.RoomListAdapter
import com.zouatene.colorimage.dialog.CreateRoomDialogFragment
import com.zouatene.colorimage.model.access.LoggedUser
import com.zouatene.colorimage.model.chat.SectionedRoomListItem.Companion.TYPE_ROOM_ITEM
import com.zouatene.colorimage.network.SocketHandler
import com.zouatene.colorimage.utils.Constants
import com.zouatene.colorimage.utils.OnUnreadMessageListener
import java.lang.ClassCastException


class RoomListFragment : Fragment(), CreateRoomDialogFragment.CreateRoomDialogListener {
    private lateinit var adapter: RoomListAdapter
    private lateinit var binding: FragmentRoomListBinding
    private val roomListViewModel: RoomListViewModel by activityViewModels()
    private lateinit var loggedUser: LoggedUser
    private lateinit var onUnreadMessageListener: OnUnreadMessageListener
    private var chatIsOpen: Boolean = false
    private lateinit var createRoomDialog: CreateRoomDialogFragment

    override fun onAttach(context: Context) {
        super.onAttach(context)

        try {
            onUnreadMessageListener = activity as OnUnreadMessageListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement OnUnreadMessageListener")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_room_list, container, false)

        val itemClickListener = createRoomItemClickListeners()

        adapter = RoomListAdapter(requireContext(), itemClickListener)
        binding.roomsRecyclerView.adapter = adapter

        loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()

        roomListViewModel.getUserRoomListData(loggedUser.username)

        binding.createChannelButton.setOnClickListener {
            showCreateChannelDialog()
        }

        roomListViewModel.roomList.observe(viewLifecycleOwner, Observer {
            val roomList = it ?: return@Observer
            adapter.roomList = roomList
            adapter.roomListCopy = roomList.clone() as ArrayList<Room>
        })

        roomListViewModel.createRoomResult.observe(viewLifecycleOwner, Observer {
            val createRoomResult = it ?: return@Observer

            if (createRoomResult.success && !adapter.isUnjoinedRoomList) {
                roomListViewModel.getUserRoomListData(loggedUser.username)
                Toast.makeText(context, "Canal créé!", Toast.LENGTH_SHORT).show()
            }
        })

        roomListViewModel.joinedRoomResult.observe(viewLifecycleOwner, Observer {
            val joinedRoomResult = it ?: return@Observer

            if (joinedRoomResult.success) {
                Toast.makeText(context, "Canal rejoins!", Toast.LENGTH_SHORT).show()
            }
        })

        roomListViewModel.deletedRoomResult.observe(viewLifecycleOwner, Observer {
            val deletedRoomResult = it ?: return@Observer

            if (deletedRoomResult.success) {
                Toast.makeText(context, "Canal supprimé!", Toast.LENGTH_SHORT).show()
            }
        })

        roomListViewModel.leaveRoomResult.observe(viewLifecycleOwner, Observer {
            val leaveRoomResult = it ?: return@Observer

            if (leaveRoomResult.success) {
                Toast.makeText(context, "Canal quitté!", Toast.LENGTH_SHORT).show()
            }
        })

        SocketHandler.mSocket.on("delete_room") {
            roomListViewModel.getUserRoomListData(loggedUser.username)
            updateChatFragmentView(adapter.selectedRoomName)
        }

        SocketHandler.mSocket.on("send_message") {
            val messageRoom = roomListViewModel.getMessageRoom(
                it[0].toString(),
                loggedUser.username
            )

            activity?.runOnUiThread {
                val selectedRoom =
                    adapter.roomList.find { room -> room.type == TYPE_ROOM_ITEM && (room as Room).name == adapter.selectedRoomName }

                if (selectedRoom != null) {
                    if (!adapter.isUnjoinedRoomList && messageRoom != (selectedRoom as Room).name || !chatIsOpen) {
                        pingMessage(messageRoom)
                    }
                } else {
                    pingMessage(messageRoom)
                }
                var resId = resources.getIdentifier(
                    R.raw.message_ping.toString(),
                    "raw", requireActivity().packageName
                )
                val mediaPlayer = MediaPlayer.create(requireActivity().applicationContext, resId)
                mediaPlayer.start()
            }
        }

        setHasOptionsMenu(true)
        (activity as AppCompatActivity).setSupportActionBar(binding.roomToolbar)

        return binding.root
    }

    private fun pingMessage(messageRoom: String) {
        adapter.incrementUnreadBadge(messageRoom)
        updateUnreadMessageCount()
    }

    private fun updateUnreadMessageCount() {
        val unreadMessagesCount = adapter.roomList.sumOf { room ->
            if (room.type == TYPE_ROOM_ITEM)
                (room as Room).unread
            else
                0
        }
        onUnreadMessageListener.onUnreadMessage(unreadMessagesCount)
    }

    private fun createRoomItemClickListeners(): OnItemClickListener {

        val itemClickListener = object : OnItemClickListener {
            override fun onItemClick(position: Int) {
                val roomName = (adapter.roomList[position] as Room).name
                if (adapter.isUnjoinedRoomList) {
                    roomListViewModel.joinRoom(roomName, loggedUser.username)
                } else {
                    if (adapter.isEditMode) {
                        if (roomName != Constants.GENERAL_ROOM) {
                            var dialogTitle: String =
                                if ((adapter.roomList[position] as Room).owner == loggedUser.username) {
                                    "Supprimer canal?"
                                } else {
                                    "Quitter canal?"
                                }

                            MaterialAlertDialogBuilder(requireContext())
                                .setTitle(dialogTitle)
                                .setNeutralButton("Non") { dialog, _ ->
                                    dialog.cancel()
                                }
                                .setPositiveButton("Oui") { _, _ ->
                                    if ((adapter.roomList[position] as Room).owner == loggedUser.username) {
                                        deleteRoom(roomName)
                                    } else {
                                        leaveRoom(roomName)
                                    }
                                }
                                .show()
                        }

                    } else {
                        changeChatView(roomName)
                        updateUnreadMessageCount()
                    }
                }
            }
        }

        return itemClickListener
    }

    private fun changeChatView(roomName: String) {
        val bundle = Bundle()
        bundle.putString("roomName", roomName)
        val chatFragment = ChatFragment()
        chatFragment.arguments = bundle

        parentFragmentManager.beginTransaction()
            .replace(R.id.chatFragment, chatFragment).commit()
    }

    private fun showCreateChannelDialog() {
        createRoomDialog = CreateRoomDialogFragment()
        createRoomDialog.show(childFragmentManager, null)
    }

    private fun deleteRoom(roomName: String) {
        roomListViewModel.deleteRoom(roomName, loggedUser.username)
        updateChatFragmentView(roomName)
    }

    private fun leaveRoom(roomName: String) {
        roomListViewModel.leaveRoom(roomName, loggedUser.username)
        updateChatFragmentView(roomName)
    }

    private fun updateChatFragmentView(roomName: String) {
        if (roomName == adapter.selectedRoomName) {
            val chatFragment = parentFragmentManager.findFragmentById(R.id.chatFragment)
            if (chatFragment != null) {
                parentFragmentManager.beginTransaction().remove(chatFragment).commit()
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu, inflater: MenuInflater) {
        super.onCreateOptionsMenu(menu, inflater)
        inflater.inflate(R.menu.search_room, menu)

        val searchItem = menu.findItem(R.id.search).actionView as SearchView
        val searchEditText = searchItem.findViewById<EditText>(R.id.search_src_text)
        searchEditText.hint = "Chercher un canal"

        setMenuListeners(menu)
        setSearchItemListeners(searchItem)
        menu.findItem(R.id.search).isVisible = !adapter.isEditMode
        menu.findItem(R.id.edit).isVisible = !adapter.isEditMode
    }

    private fun setMenuListeners(menu: Menu) {
        val editItem = menu.findItem(R.id.edit)

        menu.findItem(R.id.search).setOnActionExpandListener(object :
            MenuItem.OnActionExpandListener {
            override fun onMenuItemActionExpand(menuItem: MenuItem?): Boolean {
                adapter.isUnjoinedRoomList = true
                roomListViewModel.getUnjoinedRoomListData(loggedUser.username)
                editItem.isVisible = false
                return true
            }

            override fun onMenuItemActionCollapse(menuItem: MenuItem?): Boolean {
                adapter.isUnjoinedRoomList = false
                roomListViewModel.getUserRoomListData(loggedUser.username)
                editItem.isVisible = true
                requireActivity().invalidateOptionsMenu()
                return true
            }
        })

        editItem.setOnMenuItemClickListener {
            setEditRoomMode(true, editItem)
            true
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                setEditRoomMode(false, item)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun setEditRoomMode(editMode: Boolean, editItem: MenuItem) {
        if (editMode) {
            adapter.isEditMode = true
            editItem.isVisible = false
            (activity as AppCompatActivity).supportActionBar?.setDisplayHomeAsUpEnabled(true)
        } else {
            adapter.isEditMode = false
            editItem.isVisible = true
            (activity as AppCompatActivity).supportActionBar?.setDisplayHomeAsUpEnabled(false)
        }
        requireActivity().invalidateOptionsMenu()
    }

    private fun setSearchItemListeners(searchItem: SearchView) {
        searchItem.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                return false
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                if (newText != null) {
                    adapter.filter(newText)
                }
                return true
            }
        })
    }

    fun onChatOpened() {
        chatIsOpen = true
        adapter.roomList.forEach { room ->
            if (room.type == TYPE_ROOM_ITEM) {
                if ((room as Room).name == adapter.selectedRoomName)
                    room.unread = 0
            }
        }
        updateUnreadMessageCount()
    }

    fun onChatClosed() {
        chatIsOpen = false
    }

    override fun onCreateRoom(roomName: String) {
        roomListViewModel.createRoom(
            loggedUser.username,
            roomName
        )
        createRoomDialog.dismiss()
    }
}