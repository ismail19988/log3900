package com.zouatene.colorimage.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.zouatene.colorimage.model.team.Team
import com.zouatene.colorimage.model.response.TeamListResponse
import com.zouatene.colorimage.model.request.UserRequest
import com.zouatene.colorimage.network.RequestService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TeamViewModel {
    private val _teamList = MutableLiveData<ArrayList<Team>>()
    val teamList: LiveData<ArrayList<Team>> = _teamList

    fun getJoinedTeamList(username: String) {
        val userRoomRequest = UserRequest(username)
        RequestService.retrofitService.getJoinedTeamListData(userRoomRequest)
            .enqueue(object : Callback<TeamListResponse> {
                override fun onResponse(
                    call: Call<TeamListResponse>,
                    response: Response<TeamListResponse>
                ) {
                    if (response.code() == 200) {
                        val teams = ArrayList(response.body()!!.teams)
                        val userTeams = teams.filter { team -> team.users.map{user -> user.user}.contains(username)}

                        _teamList.value = userTeams as ArrayList<Team>
                        _teamList.value = userTeams
                    } else {
                        // TODO("Not yet implemented")
                        println("Couldn't get teams list")
                    }
                }

                override fun onFailure(call: Call<TeamListResponse>, t: Throwable) {
                    // TODO("Not yet implemented")
                    println("Failed to get teams list")
                    println(t.message)
                }
            })
    }
}