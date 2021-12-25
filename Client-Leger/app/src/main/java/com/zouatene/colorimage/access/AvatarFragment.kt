package com.zouatene.colorimage.access

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.graphics.drawable.toBitmap
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.squareup.picasso.Picasso
import com.zouatene.colorimage.BuildConfig
import com.zouatene.colorimage.R
import com.zouatene.colorimage.databinding.FragmentAvatarBinding
import com.zouatene.colorimage.dialog.AvatarCollectionsDialogFragment
import com.zouatene.colorimage.utils.Constants.PERMISSION_REQUEST_CODE
import com.zouatene.colorimage.viewmodel.AvatarCollectionsDialogViewModel
import com.zouatene.colorimage.viewmodel.AvatarViewModel
import java.io.File

class AvatarFragment : Fragment(), AvatarCollectionsDialogFragment.EditAvatarDialogListener {

    interface AvatarSelectedListener {
        fun onPictureSelectedListener(avatarByteArray: ByteArray)
        fun onDefaultAvatarSelectedListener(url: String)
    }

    private lateinit var takePictureResult: ActivityResultLauncher<Uri>
    private lateinit var binding: FragmentAvatarBinding
    private var latestImageUri: Uri? = null
    private val avatarViewModel: AvatarViewModel by activityViewModels()
    private lateinit var avatarSelectedListener: AvatarSelectedListener

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout for this fragment
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_avatar, container, false)

        val avatarCollectionsDialogViewModel: AvatarCollectionsDialogViewModel by activityViewModels()
        avatarCollectionsDialogViewModel.mapAvatars()
        Picasso.get().load(avatarCollectionsDialogViewModel.avatarUrlMap[0]).into(binding.profilePic)

        binding.editAvatarButton.setOnClickListener {
            // inflate new window to select from a list of profile pics
            var dialog = AvatarCollectionsDialogFragment()

            dialog.show(childFragmentManager, null)
        }

        binding.cameraButton.setOnClickListener {
            // camera
            if (ContextCompat.checkSelfPermission(
                    this.requireContext(),
                    Manifest.permission.CAMERA
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                openCamera()
            } else {
                checkUserRequestedDontAskAgain()
                ActivityCompat.requestPermissions(
                    requireActivity(), arrayOf(Manifest.permission.CAMERA),
                    PERMISSION_REQUEST_CODE
                )
            }
        }

        takePictureResult =
            registerForActivityResult(ActivityResultContracts.TakePicture()) { success: Boolean ->
                if (success) {
                    latestImageUri?.let { uri ->
                        binding.profilePic.setImageURI(uri)
                        avatarViewModel.changeAvatarImage(binding.profilePic.drawable.toBitmap())
                        avatarSelectedListener.onPictureSelectedListener(avatarViewModel.avatarByteArray)
                    }
                }
            }

        return binding.root
    }

    private fun openCamera() {
        lifecycleScope.launchWhenStarted {
            getTmpFileUri().let { uri ->
                latestImageUri = uri
                takePictureResult.launch(uri)
            }
        }
    }

    private fun checkUserRequestedDontAskAgain() {
        val rationalFlagCamera =
            shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)
        if (!rationalFlagCamera) {
            Toast.makeText(requireContext(), "Autorisation Refusée", Toast.LENGTH_SHORT)
                .show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        when (requestCode) {
            PERMISSION_REQUEST_CODE -> if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                openCamera()
            } else {
                Toast.makeText(requireContext(), "Autorisation Refusée", Toast.LENGTH_SHORT)
                    .show()
            }
        }
    }

    override fun onFinishEditAvatarDialog(url: String) {
        Picasso.get().load(url).into(binding.profilePic)
        avatarSelectedListener.onDefaultAvatarSelectedListener(url)
    }

    fun setAvatarImage(avatar: String, callback: () -> Unit) {
        Picasso.get().load(avatar).into(binding.profilePic, object : com.squareup.picasso.Callback {
            override fun onSuccess() {
                callback()
            }

            override fun onError(e: java.lang.Exception?) {
            }
        })
    }

    private fun getTmpFileUri(): Uri {
        val tmpFile =
            File.createTempFile("tmp_image_file", ".png", requireContext().cacheDir).apply {
                createNewFile()
                deleteOnExit()

            }
        return FileProvider.getUriForFile(
            this.requireContext(),
            "${BuildConfig.APPLICATION_ID}.provider",
            tmpFile
        )
    }

    fun setAvatarSelectedListener(listener: AvatarSelectedListener) {
        avatarSelectedListener = listener
    }
}