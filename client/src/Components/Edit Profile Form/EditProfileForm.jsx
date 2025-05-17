import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { deleteAccountAsync, updateProfileAsync, uploadProfilePicAsync, usersSelector } from "../../Redux/Reducer/usersReducer"
import { motion } from "framer-motion"
import { Camera, Check, ChevronLeft, Info, Loader2, Upload, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const EditProfileForm = () => {
  const dispatch = useDispatch()
  const { userData, loading: profileLoading, error } = useSelector(usersSelector)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    accountType: "public",
    bio: "",
    website: "",
  })
  const [profilePic, setProfilePic] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState("basic") // basic, additional, privacy
  const [formErrors, setFormErrors] = useState({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (userData?.user) {
      const user = userData.user
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        accountType: user.accountType || "public",
        bio: user.bio || "",
        website: user.website || "",
      })

      // If user has a profile pic, set it as preview
      if (user.profilePic) {
        setPreviewImage(user.profilePic)
      }
    }
  }, [userData])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors((prev) => ({
        ...prev,
        [id]: null,
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required"
    } else if (formData.username.includes(" ")) {
      errors.username = "Username cannot contain spaces"
    }

    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      errors.website = "Website URL is invalid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0]
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    try {
      await dispatch(updateProfileAsync(formData))
      // Show success message or notification
      setFormSubmitted(false)
    } catch (err) {
      console.error("Error updating profile:", err)
    }
  }

  const handleProfilePicUpload = async (e) => {
    e.preventDefault()
    if (profilePic) {
      setUploadLoading(true)
      const formData = new FormData()
      formData.append("profilePic", profilePic)

      try {
        await dispatch(uploadProfilePicAsync(formData))
        setProfilePic(null)
        setUploadSuccess(true)

        // Reset success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      } catch (error) {
        console.error("Error uploading profile picture:", error)
      } finally {
        setUploadLoading(false)
      }
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check if file is an image
      if (!selectedFile.type.match("image.*")) {
        alert("Please select an image file")
        return
      }

      // Check if file size is less than 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }

      setProfilePic(selectedFile)
      setPreviewImage(URL.createObjectURL(selectedFile))
      setUploadSuccess(false)
    }
  }

  const removeSelectedImage = () => {
    setProfilePic(null)
    setPreviewImage(userData?.user?.profilePic || null)
  }

  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      try {
        const response = await dispatch(deleteAccountAsync()).unwrap()
        if (response.success) {
          navigate("/login");
        }

      } catch (err) {
        console.error("Error deleting profile:", err);
        // Handle error (e.g., show a notification)
        toast.error("Error deleting profile. Please try again.");
      }
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="sticky top-0 bg-white shadow-sm z-10 rounded-b-xl mb-6">
          <div className="flex items-center p-4">
            <Link to={`/profile/${userData.user._id}`} className="mr-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-100 p-2 rounded-full"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </motion.div>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
          </div>
        </div>

        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-6"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Camera className="text-blue-500 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Profile Picture</h2>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-6 group">
                {previewImage ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md"
                  >
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                    {profilePic && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={removeSelectedImage}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera size={40} className="text-gray-400" />
                  </div>
                )}

                <label
                  htmlFor="profilePic"
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md transition-all duration-200"
                >
                  <Camera size={18} />
                </label>
                <input type="file" id="profilePic" onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              {profilePic && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Selected: {profilePic.name} ({(profilePic.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfilePicUpload}
                    disabled={uploadLoading}
                    className={`flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${uploadLoading
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Picture
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-full text-sm"
                >
                  <Check size={16} className="mr-1" />
                  Profile picture updated successfully!
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form Sections Navigation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveSection("basic")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${activeSection === "basic" ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Basic Info
              {activeSection === "basic" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveSection("additional")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${activeSection === "additional" ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Additional
              {activeSection === "additional" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveSection("privacy")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${activeSection === "privacy" ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Privacy
              {activeSection === "privacy" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Section */}
            {activeSection === "basic" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${formErrors.name ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <Info size={14} className="mr-1" /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${formErrors.email ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <Info size={14} className="mr-1" /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">@</span>
                      <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full pl-8 pr-3 py-2 rounded-lg border ${formErrors.username ? "border-red-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="username"
                      />
                    </div>
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <Info size={14} className="mr-1" /> {formErrors.username}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">This will be your unique identifier visible to others.</p>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tell us a little about yourself..."
                    />
                    <p className="mt-1 text-xs text-gray-500 flex justify-between">
                      <span>A brief description of yourself shown on your profile.</span>
                      <span>{formData.bio.length}/150</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Additional Info Section */}
            {activeSection === "additional" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your phone number is private and won't be shown to others.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${formErrors.website ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="https://yourwebsite.com"
                    />
                    {formErrors.website && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <Info size={14} className="mr-1" /> {formErrors.website}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your date of birth is private and won't be shown to others.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Privacy
                    </label>
                    <div className="space-y-3 mt-2">
                      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="accountType"
                          id="accountType"
                          value="public"
                          checked={formData.accountType === "public"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                        />
                        <div>
                          <span className="block text-sm font-medium text-gray-900">Public Account</span>
                          <span className="block text-xs text-gray-500">
                            Anyone can see your profile and posts. Anyone can follow you.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="accountType"
                          id="accountType"
                          value="private"
                          checked={formData.accountType === "private"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                        />
                        <div>
                          <span className="block text-sm font-medium text-gray-900">Private Account</span>
                          <span className="block text-xs text-gray-500">
                            Only approved followers can see your posts. Follow requests must be approved.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Data & Privacy</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Allow others to find me by email</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Allow others to find me by phone number</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Show activity status</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={profileLoading}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${profileLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                  }`}
              >
                {profileLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>

              {/* Delete Profile Button */}
              <button
                type="button"
                onClick={handleDeleteProfile}
                className="w-full mt-4 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all duration-200"
              >
                Delete Account
              </button>

              {error && <p className="mt-3 text-center text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

              {formSubmitted && Object.keys(formErrors).length > 0 && (
                <p className="mt-3 text-center text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                  Please fix the errors above to continue.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfileForm
