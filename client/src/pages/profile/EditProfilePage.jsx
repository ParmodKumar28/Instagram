import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteAccountAsync,
  updateProfileAsync,
  uploadProfilePicAsync,
  usersSelector,
} from "../../redux/slices/usersSlice";
import { motion } from "framer-motion";
import { Camera, Check, ChevronLeft, Loader2, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import { ALL_AVATARS, MALE_AVATARS, FEMALE_AVATARS, NEUTRAL_AVATARS } from "../../constants";
import toast from "react-hot-toast";

export function EditProfilePage() {
  const dispatch = useDispatch();
  const { signedUser, userLoading: profileLoading, userId } = useSelector(usersSelector);
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
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [formErrors, setFormErrors] = useState({});
  const [selectedAvatarCategory, setSelectedAvatarCategory] = useState("all");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectAvatar = async (avatarUrl) => {
    setPreviewImage(avatarUrl);
    setProfilePic(null);
    setAvatarLoading(true);
    try {
      await dispatch(updateProfileAsync({ profilePic: avatarUrl })).unwrap();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating avatar:", err);
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    if (signedUser) {
      const user = signedUser;
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
      });

      if (user.profilePic) {
        setPreviewImage(user.profilePic);
      }
    }
  }, [signedUser]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (formErrors[id]) {
      setFormErrors((prev) => ({
        ...prev,
        [id]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.includes(" ")) {
      errors.username = "Username cannot contain spaces";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProfileAsync(formData)).unwrap();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (profilePic) {
      setUploadLoading(true);
      const data = new FormData();
      data.append("profilePic", profilePic);

      try {
        await dispatch(uploadProfilePicAsync(data)).unwrap();
        setProfilePic(null);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setProfilePic(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
      setUploadSuccess(false);
    }
  };

  const removeSelectedImage = () => {
    setProfilePic(null);
    setPreviewImage(signedUser?.profilePic || null);
  };

  const handleDeleteProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteAccountAsync()).unwrap();
        navigate("/login");
      } catch (err) {
        console.error("Error deleting profile:", err);
      }
    }
  };

  return (
    <div className="min-h-screen py-6 px-2">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center">
          <Link to={userId ? `/profile/${userId}` : "/"} className="mr-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Edit Profile</h1>
        </div>

        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <Camera className="text-blue-500 mr-2" size={20} />
            <h2 className="text-base font-bold text-gray-800">Profile Photo</h2>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                <Avatar
                  src={previewImage || signedUser?.profilePic}
                  alt="Profile Preview"
                  gender={formData.gender || signedUser?.gender}
                  username={formData.username || signedUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>

              {profilePic && (
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow"
                >
                  <X size={14} />
                </button>
              )}

              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md transition"
              >
                <Camera size={16} />
              </label>
              <input
                type="file"
                id="profilePicInput"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {profilePic && (
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 mb-2">
                  Selected: {profilePic.name}
                </p>
                <button
                  onClick={handleProfilePicUpload}
                  disabled={uploadLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition flex items-center space-x-1.5"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} className="mr-1" />
                      <span>Upload Picture</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium mt-1">
                <Check size={14} className="mr-1" />
                Profile picture updated!
              </div>
            )}

            {/* Avatar Selector Gallery */}
            <div className="w-full mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Choose Preset Avatar</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    ({selectedAvatarCategory === "male"
                      ? MALE_AVATARS.length
                      : selectedAvatarCategory === "female"
                      ? FEMALE_AVATARS.length
                      : selectedAvatarCategory === "neutral"
                      ? NEUTRAL_AVATARS.length
                      : ALL_AVATARS.length})
                  </span>
                </span>
                <div className="flex space-x-1 bg-gray-100 p-0.5 rounded-lg text-xs">
                  {[
                    { id: "all", label: "All" },
                    { id: "male", label: "Male" },
                    { id: "female", label: "Female" },
                    { id: "neutral", label: "Neutral" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedAvatarCategory(id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        selectedAvatarCategory === id
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
                {(selectedAvatarCategory === "female"
                  ? FEMALE_AVATARS
                  : selectedAvatarCategory === "male"
                  ? MALE_AVATARS
                  : selectedAvatarCategory === "neutral"
                  ? NEUTRAL_AVATARS
                  : ALL_AVATARS
                ).map((avatarUrl, idx) => {
                  const isSelected = (previewImage || signedUser?.profilePic) === avatarUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={avatarLoading}
                      onClick={() => handleSelectAvatar(avatarUrl)}
                      title={`Select preset ${selectedAvatarCategory === "female" ? "female" : selectedAvatarCategory === "male" ? "male" : ""} avatar #${idx + 1}`}
                      className={`relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                        isSelected
                          ? "ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-md"
                          : "opacity-85 hover:opacity-100 border border-gray-200 shadow-xs hover:shadow"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-full object-cover bg-gray-50"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-[0.5px] flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow font-bold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection("basic")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeSection === "basic"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveSection("additional")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeSection === "additional"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Additional
            </button>
            <button
              onClick={() => setActiveSection("privacy")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeSection === "privacy"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Privacy
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {activeSection === "basic" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Full name"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Email"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Username"
                  />
                  {formErrors.username && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>
            )}

            {activeSection === "additional" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Account Privacy
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="accountType"
                        id="accountTypePublic"
                        value="public"
                        checked={formData.accountType === "public"}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-gray-900">Public Account</span>
                        <span className="block text-xs text-gray-500">
                          Anyone can see your profile and posts.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="accountType"
                        id="accountTypePrivate"
                        value="private"
                        checked={formData.accountType === "private"}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-gray-900">Private Account</span>
                        <span className="block text-xs text-gray-500">
                          Only approved followers can view your posts.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition shadow-sm flex justify-center items-center"
              >
                {profileLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-4 rounded-lg text-sm transition border border-red-200"
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;
