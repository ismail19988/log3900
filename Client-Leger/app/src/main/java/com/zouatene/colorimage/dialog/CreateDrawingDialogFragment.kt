package com.zouatene.colorimage.dialog

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.Observer
import com.zouatene.colorimage.access.LoggedUserManager
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentCreateDrawingDialogBinding
import com.zouatene.colorimage.model.Privacy
import com.zouatene.colorimage.viewmodel.CreateDrawingDialogViewModel
import com.zouatene.colorimage.viewmodel.RegisterViewModel
import com.zouatene.colorimage.viewmodel.TeamViewModel
import java.lang.ClassCastException

class CreateDrawingDialogFragment : DialogFragment() {

    interface CreateDrawingDialogListener {
        fun onSuccessCreateDrawingDialog(drawingName: String)
    }

    private val drawingVisibilityList = mutableListOf(
        "Visibilité",
        "Public",
        "Protégé",
        "Privé"
    )

    private lateinit var binding: FragmentCreateDrawingDialogBinding
    private var selectedPrivacyIndex = 0
    private lateinit var createDrawingDialogListener: CreateDrawingDialogListener
    private lateinit var teamViewModel: TeamViewModel
    private lateinit var registerViewModel: RegisterViewModel
    private var drawingOwnerList = mutableListOf(
        "Propriétaire",
    )

    override fun onAttach(context: Context) {
        super.onAttach(context)
        try {
            createDrawingDialogListener =
                parentFragment as CreateDrawingDialogListener
        } catch (e: ClassCastException) {
            throw ClassCastException(context.toString() + "must implement CreateDrawingPasswordDialogListener")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_create_drawing_dialog,
            container,
            false
        )

        val loggedUser = LoggedUserManager(requireContext()).getLoggedInUser()
        registerViewModel = RegisterViewModel(requireContext())

        teamViewModel = TeamViewModel()
        teamViewModel.getJoinedTeamList(loggedUser.username)

        teamViewModel.teamList.observe(viewLifecycleOwner, Observer {
            val teamList = it ?: return@Observer
            println(teamList)
            drawingOwnerList.clear()
            drawingOwnerList.add("Propriétaire")
            drawingOwnerList.add(loggedUser.username)
            drawingOwnerList.addAll(teamList.map { team -> team.name } as ArrayList<String>)
            createOwnerSpinnerItems()
        })

        val createDrawingViewModel = CreateDrawingDialogViewModel(requireContext())

        createPrivacySpinnerItems()

        binding.drawingTitleInput.doAfterTextChanged {
            binding.createDrawingButton.isEnabled = checkFormValid()
        }

        binding.drawingPasswordInput.doAfterTextChanged {
            binding.createDrawingButton.isEnabled = checkFormValid()
        }

        binding.createDrawingButton.setOnClickListener {
            var team: String? = null
            if (binding.drawingOwnerSpinner.selectedItem.toString() != loggedUser.username) {
                team = binding.drawingOwnerSpinner.selectedItem.toString()
            }
            val passwordText = if (binding.drawingPasswordInput.text.toString()
                    .isEmpty()
            ) null else binding.drawingPasswordInput.text.toString()
            createDrawingViewModel.createDrawing(
                binding.drawingTitleInput.text.toString(),
                binding.drawingOwnerSpinner.selectedItem.toString(),
                Privacy.values()[selectedPrivacyIndex - 1],
                passwordText,
                team
            )
        }

        binding.cancelButton.setOnClickListener {
            dismiss()
        }

        createDrawingViewModel.createDrawingResult.observe(viewLifecycleOwner, Observer {
            val createDrawingResult = it ?: return@Observer
            if (createDrawingResult)
                createDrawingDialogListener.onSuccessCreateDrawingDialog(
                    binding.drawingTitleInput.text.toString()
                )
        })

        binding.drawingPasswordInput.doAfterTextChanged {
            registerViewModel.checkPasswordValid(binding.drawingPasswordInput.text.toString())
        }

        registerViewModel.passwordErrors.observe(viewLifecycleOwner, Observer {
            val passwordErrorsState = it ?: return@Observer
            val circle = "\u25CF"
            val errorString =
                if (passwordErrorsState.isNotEmpty()) circle + passwordErrorsState.joinToString(
                    "\n$circle"
                )
                else null
            binding.drawingPasswordInputLayout.error = errorString
            checkFormValid()
        })

        return binding.root
    }

    private fun createOwnerSpinnerItems() {
        val adapter: ArrayAdapter<String> = object : ArrayAdapter<String>(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            drawingOwnerList
        ) {
            override fun getDropDownView(
                position: Int,
                convertView: View?,
                parent: ViewGroup
            ): View {
                val view: TextView = super.getDropDownView(
                    position,
                    convertView,
                    parent
                ) as TextView
                // set item text bold
                view.setTypeface(view.typeface, Typeface.BOLD)

                if (position == binding.drawingOwnerSpinner.selectedItemPosition && position != 0) {
                    view.setTextColor(resources.getColor(R.color.purple_500, null))
                }

                // make hint item color gray
                if (position == 0) {
                    view.setTextColor(Color.LTGRAY)
                }

                return view
            }

            override fun isEnabled(position: Int): Boolean {
                // disable first item
                // first item is display as hint
                return position != 0
            }
        }

        binding.drawingOwnerSpinner.adapter = adapter

        binding.drawingOwnerSpinner.onItemSelectedListener = object :
            AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View,
                position: Int,
                id: Long
            ) {
                println("position")
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }
        }
    }

    private fun createPrivacySpinnerItems() {

        val adapter: ArrayAdapter<String> = object : ArrayAdapter<String>(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            drawingVisibilityList
        ) {
            override fun getDropDownView(
                position: Int,
                convertView: View?,
                parent: ViewGroup
            ): View {
                val view: TextView = super.getDropDownView(
                    position,
                    convertView,
                    parent
                ) as TextView
                // set item text bold
                view.setTypeface(view.typeface, Typeface.BOLD)

                if (position == binding.privacySpinner.selectedItemPosition && position != 0) {
                    view.setTextColor(resources.getColor(R.color.purple_500, null))
                }

                // make hint item color gray
                if (position == 0) {
                    view.setTextColor(Color.LTGRAY)
                }

                return view
            }

            override fun isEnabled(position: Int): Boolean {
                // disable first item
                // first item is display as hint
                return position != 0
            }
        }

        binding.privacySpinner.adapter = adapter

        binding.privacySpinner.onItemSelectedListener = object :
            AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View,
                position: Int,
                id: Long
            ) {
                if (position == 2) {
                    binding.drawingPasswordInputLayout.visibility = View.VISIBLE
                    binding.drawingPasswordInput.text?.clear()
                } else {
                    binding.drawingPasswordInputLayout.visibility = View.GONE
                }
                selectedPrivacyIndex = position
                binding.createDrawingButton.isEnabled = checkFormValid()
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
            }
        }
    }

    private fun checkFormValid(): Boolean {
        return if (selectedPrivacyIndex - 1 == Privacy.PROTECTED.ordinal)
            !binding.drawingTitleInput.text.isNullOrBlank() && !binding.drawingPasswordInput.text.isNullOrBlank() && binding.drawingPasswordInput.error.isNullOrBlank()
        else
            !binding.drawingTitleInput.text.isNullOrBlank() && selectedPrivacyIndex != 0

    }
}
