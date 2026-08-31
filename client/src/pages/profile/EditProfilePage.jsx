import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteAccountAsync,
  updateProfileAsync,
  uploadProfilePicAsync,
  logoutAsync,
  usersSelector,
} from "../../redux/slices/usersSlice";
import { motion } from "framer-motion";
import { Camera, Check, ChevronLeft, Loader2, Upload, X, LogOut } from "lucide-react";
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
    const { id, name, value } = e.target;
    const fieldKey = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));

    if (formErrors[fieldKey]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldKey]: null,
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

    const payload = { ...formData };
    if (!payload.phone) delete payload.phone;
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    if (!payload.website) delete payload.website;
    if (!payload.gender) delete payload.gender;

    try {
      await dispatch(updateProfileAsync(payload)).unwrap();
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

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-3.5 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={userId ? `/profile/${userId}` : "/"}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </motion.div>
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Edit Profile</h1>
          </div>
        </div>

        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex items-center mb-4">
            <Camera className="text-[#0095F6] mr-2" size={20} />
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Profile Photo</h2>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
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
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}

              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0 bg-[#0095F6] hover:bg-[#1877F2] text-white p-2 rounded-full cursor-pointer shadow-md transition"
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
                <p className="text-xs text-gray-500 mb-2 truncate max-w-[240px]">
                  Selected: {profilePic.name}
                </p>
                <button
                  onClick={handleProfilePicUpload}
                  disabled={uploadLoading}
                  className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold px-4 py-2 rounded-full transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
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
            <div className="w-full mt-5 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Preset Avatars</span>
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
                <div className="flex space-x-1 bg-gray-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
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
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        selectedAvatarCategory === id
                          ? "bg-white text-[#0095F6] shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
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
                      title={`Select preset avatar #${idx + 1}`}
                      className={`relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-200 transform hover:scale-105 focus:outline-none cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-[#0095F6] ring-offset-2 scale-105 shadow-md"
                          : "opacity-85 hover:opacity-100 border border-gray-200 shadow-2xs"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-full object-cover bg-gray-50"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#0095F6]/30 backdrop-blur-[0.5px] flex items-center justify-center">
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
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden mb-6">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setActiveSection("basic")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeSection === "basic"
                  ? "text-[#0095F6] border-b-2 border-[#0095F6] bg-white"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("additional")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeSection === "additional"
                  ? "text-[#0095F6] border-b-2 border-[#0095F6] bg-white"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Additional
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("privacy")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeSection === "privacy"
                  ? "text-[#0095F6] border-b-2 border-[#0095F6] bg-white"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Privacy
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {activeSection === "basic" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                    placeholder="Full name"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                    placeholder="Email"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                    placeholder="Username"
                  />
                  {formErrors.username && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={150}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none resize-none transition"
                    placeholder="Write something about yourself..."
                  />
                  <div className="text-right text-[11px] text-gray-400 mt-0.5">
                    {formData.bio.length}/150
                  </div>
                </div>
              </div>
            )}

            {activeSection === "additional" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] focus:outline-none transition bg-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
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
                  <div className="space-y-3">
                    <label
                      onClick={() => setFormData((prev) => ({ ...prev, accountType: "public" }))}
                      className={`flex items-start space-x-3.5 p-3.5 sm:p-4 border rounded-xl cursor-pointer transition ${
                        formData.accountType === "public"
                          ? "border-[#0095F6] bg-blue-50/40 ring-1 ring-[#0095F6]/30"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        id="accountTypePublic"
                        value="public"
                        checked={formData.accountType === "public"}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#0095F6] focus:ring-[#0095F6] cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">Public Account</span>
                        <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                          Anyone on or off Socialgram can see your profile, posts, and reels.
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => setFormData((prev) => ({ ...prev, accountType: "private" }))}
                      className={`flex items-start space-x-3.5 p-3.5 sm:p-4 border rounded-xl cursor-pointer transition ${
                        formData.accountType === "private"
                          ? "border-[#0095F6] bg-blue-50/40 ring-1 ring-[#0095F6]/30"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        id="accountTypePrivate"
                        value="private"
                        checked={formData.accountType === "private"}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#0095F6] focus:ring-[#0095F6] cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">Private Account</span>
                        <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                          Only approved followers can view your posts, reels, and stories.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2.5">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-[#0095F6] hover:bg-[#1877F2] active:scale-[0.99] disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-xs flex justify-center items-center cursor-pointer"
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
                onClick={handleLogout}
                className="w-full bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-800 font-semibold py-2.5 px-4 rounded-xl text-sm transition flex justify-center items-center space-x-2 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                className="w-full bg-red-50 hover:bg-red-100 active:scale-[0.99] text-red-600 font-semibold py-2.5 px-4 rounded-xl text-sm transition border border-red-200 cursor-pointer"
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
