package com.zouatene.colorimage.network

import com.zouatene.colorimage.utils.Constants
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var mSocket: Socket

    @Synchronized
    fun setSocket(username: String) {
        try {

            val opts = IO.Options()
            opts.query = "user=${username}"
            mSocket = IO.socket(Constants.SERVER_URL, opts)
        } catch (e: URISyntaxException) {
            println("Could not create a mSocket in SocketHandler!")
        }
    }

    @Synchronized
    fun establishConnection() {
        mSocket.connect()

    }

    @Synchronized
    fun closeConnection() {
        mSocket.disconnect()
    }

}