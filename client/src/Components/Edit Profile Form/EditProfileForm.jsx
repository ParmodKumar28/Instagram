import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileAsync, uploadProfilePicAsync, usersSelector } from '../../Redux/Reducer/usersReducer';

const EditProfileForm = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(usersSelector);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [accountType, setAccountType] = useState('public');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state for profile picture upload

    useEffect(() => {
        if (userData) {
            setName(userData.user.name || '');
            setEmail(userData.user.email || '');
            setUsername(userData.user.username || '');
            setPhone(userData.user.phone || '');
            // Extract only the date part from the ISO string and set it to dateOfBirth state
            const userDateOfBirth = userData.user.dateOfBirth ? userData.user.dateOfBirth.split('T')[0] : '';
            setDateOfBirth(userDateOfBirth);
            setGender(userData.user.gender || '');
            setAccountType(userData.user.accountType || 'public');
            setBio(userData.user.bio || '');
            setWebsite(userData.user.website || '');
        }
    }, [userData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add validation for required fields
        if (!name || !email || !username) {
            alert('Please fill out all required fields.');
            return;
        }
        dispatch(updateProfileAsync({ name, email, username, phone, dateOfBirth, gender, accountType, bio, website }));
    };

    const handleProfilePicUpload = async (e) => {
        e.preventDefault();
        if (profilePic) {
            setLoading(true); // Set loading to true when starting profile picture upload
            const formData = new FormData();
            formData.append('profilePic', profilePic);
            try {
                await dispatch(uploadProfilePicAsync(formData));
                setProfilePic(null);
                setPreviewImage(null);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            } finally {
                setLoading(false); // Set loading to false after profile picture upload completes or fails
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setProfilePic(selectedFile);
            setPreviewImage(URL.createObjectURL(selectedFile));
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            {/* Profile Picture Upload Form */}
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Profile Picture</h2>
                <form onSubmit={handleProfilePicUpload}>
                    <div className="mb-4">
                        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">Choose a picture</label>
                        <input type="file" id="profilePic" onChange={handleFileChange} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        {previewImage && <img src={previewImage} alt="Preview" className="mt-2 w-20 h-20 rounded-full" />}
                    </div>
                    {previewImage &&
                        <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>}
                </form>
            </div>
            <hr className="border-gray-300" />
            {/* Profile Details Form */}
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select id="accountType" value={accountType} onChange={(e) => setAccountType(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                        <input type="text" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 p-2 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileForm;
