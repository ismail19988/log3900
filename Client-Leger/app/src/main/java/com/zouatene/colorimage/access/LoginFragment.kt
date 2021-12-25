package com.zouatene.colorimage.access

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import androidx.core.widget.doAfterTextChanged
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import androidx.navigation.findNavController
import com.zouatene.colorimage.R
import com.zouatene.colorimage.activity.MainActivity
import com.zouatene.colorimage.databinding.FragmentLoginBinding
import com.zouatene.colorimage.model.*
import com.zouatene.colorimage.viewmodel.LoginViewModel

class LoginFragment : Fragment() {

    private lateinit var loginViewModel: LoginViewModel
    private lateinit var binding: FragmentLoginBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_login, container, false)

        binding.createAccountTextClickable.setOnClickListener { view: View ->
            view.findNavController().navigate(R.id.action_loginFragment_to_registerFragment)
        }

        val emailField = binding.emailFieldLogin
        val passwordField = binding.passwordFieldLogin

        loginViewModel = LoginViewModel(requireContext())

        loginViewModel.loginFormState.observe(viewLifecycleOwner, Observer {
            val loginState = it ?: return@Observer

            binding.emailLayoutLogin.error = loginState.emailError
            binding.passwordLayoutLogin.error = loginState.passwordError

            binding.loginErrorText.visibility = View.INVISIBLE
        })

        emailField.doAfterTextChanged {
            loginViewModel.checkEmail(emailField.text.toString())
        }

        passwordField.doAfterTextChanged {
            loginViewModel.checkPassword(passwordField.text.toString())
        }

        binding.signInButton.setOnClickListener {
            val email: String = emailField.text.toString()
            val password: String = passwordField.text.toString()
            loginViewModel.login(email, password)
        }

        loginViewModel.loginResult.observe(viewLifecycleOwner, Observer {
            val loginResult = it ?: return@Observer

            if (loginResult.success == true) {
                val intent = Intent(requireView().context, MainActivity::class.java)
                intent.flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)

            } else {
                binding.loginErrorText.text = loginResult.errorText
                binding.loginErrorText.visibility = View.VISIBLE

                val shake = AnimationUtils.loadAnimation(requireContext(), R.anim.shake)
                binding.loginContainer.startAnimation(shake)
            }
        })

        return binding.root
    }
}